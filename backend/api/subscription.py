"""
Stripe subscription management API routes.
Handles checkout sessions, webhooks, refunds, and subscription management.
Works with anonymous_id to maintain zero-knowledge architecture.
"""
from fastapi import APIRouter, HTTPException, Request, Header, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr
from typing import Optional
import stripe
import os
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from database.connection import get_db
from database.models import AnonymousUser, Subscription, CreditRequest
from auth.session_manager import create_session_manager

router = APIRouter(prefix="/api/subscription", tags=["subscription"])

# Initialize Stripe - reload from env on each module load
import sys
if 'stripe' in sys.modules:
    import importlib
    importlib.reload(stripe)

# CRITICAL: Stripe secret key must be set via environment variable
# No default value - fail fast if not configured
stripe_secret_key = os.getenv("STRIPE_SECRET_KEY")
if not stripe_secret_key:
    import sys
    print("\n" + "="*80, file=sys.stderr)
    print("CRITICAL ERROR: STRIPE_SECRET_KEY environment variable not set!", file=sys.stderr)
    print("="*80, file=sys.stderr)
    print("\nFor production, set STRIPE_SECRET_KEY=sk_live_...", file=sys.stderr)
    print("For testing, set STRIPE_SECRET_KEY=sk_test_...", file=sys.stderr)
    print("="*80 + "\n", file=sys.stderr)
    # In production, fail hard; in development, allow test key
    if os.getenv("ENVIRONMENT", "development").lower() not in ["development", "dev", "test"]:
        sys.exit(1)
    stripe_secret_key = "sk_test_your-stripe-secret-key"  # Only for dev/test

stripe.api_key = stripe_secret_key

# Pricing configuration - $1/month accessible tier
MONTHLY_PRICE = 100  # $1.00 in cents
PRICE_PER_SEAT = 800000  # Legacy value, not used in current tier
MAX_SEATS = 1  # Single user subscription
TRIAL_PERIOD_DAYS = 0  # No trial period
MAX_RESUBSCRIPTIONS = 999  # Effectively unlimited
REFUND_PERIOD_DAYS = 14
CREDIT_PERIOD_DAYS = 60

# Stripe IDs ($1/month accessible tier)
PRODUCT_ID = "prod_TTzej3xRNJiuWR"
PRICE_ID = "price_1SX1fwPbrn8kzeBd7WDE08us"


# Pydantic models
class CheckoutSessionRequest(BaseModel):
    email: Optional[EmailStr] = None  # Optional - can use anonymous_id instead
    anonymous_id: Optional[str] = None  # Primary identifier for anonymous users
    user_id: Optional[str] = None  # Legacy support


class CancelSubscriptionRequest(BaseModel):
    subscription_id: str


class RefundRequest(BaseModel):
    subscription_id: str
    reason: Optional[str] = None


class CreditRequest(BaseModel):
    subscription_id: str
    reason: str
    email: EmailStr


@router.post("/create-checkout-session")
async def create_checkout_session(
    request: CheckoutSessionRequest,
    http_request: Request = None,
    db: Session = Depends(get_db)
):
    """
    Create a Stripe Checkout session for subscription.
    Works with anonymous_id (preferred) or email (legacy).
    Price: $1/month accessible tier
    """
    try:
        # Get anonymous_id from request or session
        anonymous_id = request.anonymous_id
        if not anonymous_id and http_request:
            session = get_session_from_request(http_request)
            if session:
                anonymous_id = session.get("anonymous_id")
        
        # Determine email - prefer from request, or get from anonymous_id
        email = request.email
        if not email and anonymous_id:
            # Try to get email from anonymous user's linked accounts
            user = db.query(AnonymousUser).filter(AnonymousUser.id == anonymous_id).first()
            if user and user.meta_data:
                # Check for email in social accounts or emails
                if "emails" in user.meta_data and user.meta_data["emails"]:
                    email = user.meta_data["emails"][0].get("address")
                elif "social_accounts" in user.meta_data:
                    # Try Google account first
                    if "google" in user.meta_data["social_accounts"]:
                        email = user.meta_data["social_accounts"]["google"].get("provider_data", {}).get("email")
        
        if not email:
            raise HTTPException(
                status_code=400,
                detail="Email required. Please authenticate with Google or provide email."
            )
        
        # Get or create customer
        customer = await get_or_create_customer(email, anonymous_id or request.user_id)
        subscription_count = await get_customer_subscription_count(customer.id)

        if subscription_count >= MAX_RESUBSCRIPTIONS:
            raise HTTPException(
                status_code=403,
                detail={
                    "error": "Maximum resubscription limit reached",
                    "message": f"You have reached the maximum of {MAX_RESUBSCRIPTIONS} resubscriptions. Please contact support."
                }
            )

        # Create checkout session
        session = stripe.checkout.Session.create(
            customer=customer.id,
            payment_method_types=["card"],
            line_items=[
                {
                    "price": PRICE_ID,  # Use pre-configured price with trial
                    "quantity": 1,
                }
            ],
            mode="subscription",
            success_url=f"{os.getenv('FRONTEND_URL', 'https://jobmatch.zip')}/dashboard?subscription=success&session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{os.getenv('FRONTEND_URL', 'https://jobmatch.zip')}/",
            metadata={
                "anonymous_id": anonymous_id or "",
                "user_id": request.user_id or "",
                "subscription_number": str(subscription_count + 1),
            },
            subscription_data={
                "metadata": {
                    "anonymous_id": anonymous_id or "",
                    "user_id": request.user_id or "",
                    "subscription_number": str(subscription_count + 1),
                    "start_date": datetime.utcnow().isoformat(),
                }
            },
        )

        return {
            "session_id": session.id,
            "url": session.url,
            "subscription_count": subscription_count + 1,
            "max_subscriptions": MAX_RESUBSCRIPTIONS,
        }
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail={"error": str(e)})
    except Exception as e:
        raise HTTPException(status_code=500, detail={"error": str(e)})


@router.get("/status/{customer_id}")
async def get_subscription_status(customer_id: str):
    """Get subscription status for a customer."""
    try:
        subscriptions = stripe.Subscription.list(
            customer=customer_id, status="all", limit=100
        )

        active_subscription = next(
            (sub for sub in subscriptions.data if sub.status in ["active", "trialing"]),
            None
        )

        subscription_count = len([
            sub for sub in subscriptions.data if sub.status != "canceled"
        ])

        return {
            "has_active_subscription": active_subscription is not None,
            "subscription": active_subscription,
            "subscription_count": subscription_count,
            "max_subscriptions": MAX_RESUBSCRIPTIONS,
            "can_resubscribe": subscription_count < MAX_RESUBSCRIPTIONS,
        }
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail={"error": str(e)})


@router.get("/status-by-anonymous-id/{anonymous_id}")
async def get_subscription_status_by_anonymous_id(
    anonymous_id: str,
    db: Session = Depends(get_db)
):
    """
    Get subscription status by anonymous_id.
    Maintains zero-knowledge - only returns subscription status, not identity.
    """
    try:
        # Find user by anonymous_id
        user = db.query(AnonymousUser).filter(AnonymousUser.id == anonymous_id).first()
        if not user:
            return {
                "has_active_subscription": False,
                "anonymous_id": anonymous_id,
                "message": "User not found"
            }
        
        # Get email from user's linked accounts
        email = None
        if user.meta_data:
            if "emails" in user.meta_data and user.meta_data["emails"]:
                email = user.meta_data["emails"][0].get("address")
            elif "social_accounts" in user.meta_data:
                if "google" in user.meta_data["social_accounts"]:
                    email = user.meta_data["social_accounts"]["google"].get("provider_data", {}).get("email")
        
        if not email:
            return {
                "has_active_subscription": False,
                "anonymous_id": anonymous_id,
                "message": "No email linked to anonymous account"
            }
        
        # Find Stripe customer by email
        customers = stripe.Customer.list(email=email, limit=1)
        if not customers.data:
            return {
                "has_active_subscription": False,
                "anonymous_id": anonymous_id
            }
        
        customer = customers.data[0]
        
        # Get subscription status
        subscriptions = stripe.Subscription.list(
            customer=customer.id, status="all", limit=100
        )

        active_subscription = next(
            (sub for sub in subscriptions.data if sub.status in ["active", "trialing"]),
            None
        )

        return {
            "has_active_subscription": active_subscription is not None,
            "subscription": {
                "id": active_subscription.id if active_subscription else None,
                "status": active_subscription.status if active_subscription else None,
                "current_period_end": active_subscription.current_period_end if active_subscription else None,
            } if active_subscription else None,
            "anonymous_id": anonymous_id
        }
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail={"error": str(e)})
    except Exception as e:
        logger.error(f"Error getting subscription status: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail={"error": str(e)})


@router.post("/cancel")
async def cancel_subscription(request: CancelSubscriptionRequest):
    """Cancel an active subscription."""
    try:
        subscription = stripe.Subscription.cancel(request.subscription_id)
        return {
            "success": True,
            "subscription": subscription,
            "message": "Subscription cancelled successfully"
        }
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail={"error": str(e)})


@router.post("/request-refund")
async def request_refund(request: RefundRequest):
    """
    Request a refund within 14 days of subscription.
    After 14 days, user must request credits instead.
    """
    try:
        subscription = stripe.Subscription.retrieve(request.subscription_id)
        subscription_start = datetime.fromtimestamp(subscription.created)
        days_since_start = (datetime.utcnow() - subscription_start).days

        # Check if within 14-day refund period
        if days_since_start > REFUND_PERIOD_DAYS:
            return JSONResponse(
                status_code=403,
                content={
                    "error": "Refund period expired",
                    "message": f"Refunds are only available within {REFUND_PERIOD_DAYS} days of subscription. You may be eligible for credits instead.",
                    "eligible_for_credits": days_since_start <= CREDIT_PERIOD_DAYS,
                }
            )

        # Get latest invoice
        invoices = stripe.Invoice.list(subscription=request.subscription_id, limit=1)
        if not invoices.data:
            raise HTTPException(status_code=404, detail={"error": "No invoices found"})

        invoice = invoices.data[0]
        if not invoice.payment_intent:
            raise HTTPException(status_code=400, detail={"error": "No payment found"})

        # Create refund
        refund = stripe.Refund.create(
            payment_intent=invoice.payment_intent,
            reason="requested_by_customer",
            metadata={
                "subscription_id": request.subscription_id,
                "customer_reason": request.reason or "No reason provided",
            },
        )

        # Cancel subscription
        stripe.Subscription.cancel(request.subscription_id)

        return {
            "success": True,
            "refund": refund,
            "message": "Refund processed successfully. Your subscription has been cancelled."
        }
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail={"error": str(e)})


@router.post("/request-credits")
async def request_credits(request: CreditRequest, db: Session = Depends(get_db)):
    """
    Request credits within 60 days (requires written correspondence).
    Credits must be manually reviewed by support team.
    """
    try:
        subscription = stripe.Subscription.retrieve(request.subscription_id)
        subscription_start = datetime.fromtimestamp(subscription.created)
        days_since_start = (datetime.utcnow() - subscription_start).days

        if days_since_start > CREDIT_PERIOD_DAYS:
            return JSONResponse(
                status_code=403,
                content={
                    "error": "Credit period expired",
                    "message": f"Credits are only available within {CREDIT_PERIOD_DAYS} days of subscription."
                }
            )

        # Store credit request in database
        try:
            # Get subscription to find anonymous_id
            db_subscription = db.query(Subscription).filter(
                Subscription.stripe_subscription_id == request.subscription_id
            ).first()
            
            anonymous_id = None
            if db_subscription:
                anonymous_id = db_subscription.anonymous_id
            
            credit_request = CreditRequest(
                subscription_id=request.subscription_id,
                anonymous_id=anonymous_id,
                email=request.email,
                reason=request.reason,
                days_since_start=days_since_start,
                status="pending"
            )
            db.add(credit_request)
            db.commit()
            
            # TODO: Send email to support team
            # Email functionality can be added here using SES or SMTP
            print(f"Credit request created: ID {credit_request.id}, Subscription: {request.subscription_id}")
            
            return {
                "success": True,
                "message": "Credit request received. Our team will review and respond via email within 2 business days.",
                "request_id": credit_request.id,
                "request_details": {
                    "subscription_id": request.subscription_id,
                    "email": request.email,
                    "reason": request.reason,
                    "days_since_start": days_since_start,
                }
            }
        except Exception as e:
            db.rollback()
            print(f"Error storing credit request: {e}")
            # Still return success to user, but log the error
            return {
                "success": True,
                "message": "Credit request received. Our team will review and respond via email within 2 business days.",
                "request_details": {
                    "subscription_id": request.subscription_id,
                    "email": request.email,
                    "reason": request.reason,
                    "days_since_start": days_since_start,
                }
            }
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail={"error": str(e)})


@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(None, alias="stripe-signature"),
    db: Session = Depends(get_db)
):
    """
    Stripe webhook handler for subscription events.
    Configure this URL in your Stripe Dashboard: https://jobmatch.zip/api/subscription/webhook
    """
    webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")
    if not webhook_secret:
        raise HTTPException(status_code=500, detail={"error": "Webhook secret not configured"})

    payload = await request.body()

    try:
        event = stripe.Webhook.construct_event(
            payload, stripe_signature, webhook_secret
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail={"error": "Invalid payload"})
    except stripe.error.SignatureVerificationError as e:
        raise HTTPException(status_code=400, detail={"error": "Invalid signature"})

    # Handle the event
    event_type = event["type"]
    data = event["data"]["object"]

    try:
        if event_type == "checkout.session.completed":
            print(f"Checkout completed: {data['id']}")
            # Extract anonymous_id and customer info from metadata
            metadata = data.get("metadata", {})
            anonymous_id = metadata.get("anonymous_id")
            customer_email = data.get("customer_email") or data.get("customer_details", {}).get("email")
            customer_id = data.get("customer")
            subscription_id = data.get("subscription")
            
            # Create or update subscription record
            if subscription_id:
                subscription = db.query(Subscription).filter(
                    Subscription.stripe_subscription_id == subscription_id
                ).first()
                
                if not subscription:
                    subscription = Subscription(
                        stripe_subscription_id=subscription_id,
                        stripe_customer_id=customer_id,
                        stripe_checkout_session_id=data['id'],
                        anonymous_id=anonymous_id,
                        email=customer_email,
                        status="active",
                        meta_data=metadata
                    )
                    db.add(subscription)
                else:
                    subscription.stripe_checkout_session_id = data['id']
                    subscription.email = customer_email or subscription.email
                    subscription.anonymous_id = anonymous_id or subscription.anonymous_id
                    subscription.status = "active"
                
                db.commit()
                print(f"Subscription record created/updated: {subscription_id}")

        elif event_type == "customer.subscription.created":
            print(f"Subscription created: {data['id']}")
            subscription_id = data['id']
            customer_id = data.get("customer")
            anonymous_id = data.get("metadata", {}).get("anonymous_id")
            
            # Get subscription details from Stripe
            stripe_subscription = stripe.Subscription.retrieve(subscription_id)
            
            # Create subscription record
            subscription = db.query(Subscription).filter(
                Subscription.stripe_subscription_id == subscription_id
            ).first()
            
            if not subscription:
                subscription = Subscription(
                    stripe_subscription_id=subscription_id,
                    stripe_customer_id=customer_id,
                    anonymous_id=anonymous_id,
                    status=data.get("status", "active"),
                    current_period_start=datetime.fromtimestamp(data.get("current_period_start", 0)) if data.get("current_period_start") else None,
                    current_period_end=datetime.fromtimestamp(data.get("current_period_end", 0)) if data.get("current_period_end") else None,
                    cancel_at_period_end=data.get("cancel_at_period_end", False),
                    meta_data=data.get("metadata", {})
                )
                db.add(subscription)
                db.commit()
                print(f"Subscription activated: {subscription_id} for anonymous_id: {anonymous_id}")

        elif event_type == "customer.subscription.updated":
            print(f"Subscription updated: {data['id']}")
            subscription_id = data['id']
            anonymous_id = data.get("metadata", {}).get("anonymous_id")
            
            # Update subscription record
            subscription = db.query(Subscription).filter(
                Subscription.stripe_subscription_id == subscription_id
            ).first()
            
            if subscription:
                subscription.status = data.get("status", subscription.status)
                subscription.current_period_start = datetime.fromtimestamp(data.get("current_period_start", 0)) if data.get("current_period_start") else subscription.current_period_start
                subscription.current_period_end = datetime.fromtimestamp(data.get("current_period_end", 0)) if data.get("current_period_end") else subscription.current_period_end
                subscription.cancel_at_period_end = data.get("cancel_at_period_end", subscription.cancel_at_period_end)
                
                if anonymous_id:
                    subscription.anonymous_id = anonymous_id
                
                db.commit()
                print(f"Subscription updated: {subscription_id}, status: {subscription.status}")
            else:
                # Create if doesn't exist
                subscription = Subscription(
                    stripe_subscription_id=subscription_id,
                    stripe_customer_id=data.get("customer"),
                    anonymous_id=anonymous_id,
                    status=data.get("status", "active"),
                    current_period_start=datetime.fromtimestamp(data.get("current_period_start", 0)) if data.get("current_period_start") else None,
                    current_period_end=datetime.fromtimestamp(data.get("current_period_end", 0)) if data.get("current_period_end") else None,
                    cancel_at_period_end=data.get("cancel_at_period_end", False),
                    meta_data=data.get("metadata", {})
                )
                db.add(subscription)
                db.commit()

        elif event_type == "customer.subscription.deleted":
            print(f"Subscription deleted: {data['id']}")
            subscription_id = data['id']
            anonymous_id = data.get("metadata", {}).get("anonymous_id")
            
            # Update subscription status to canceled
            subscription = db.query(Subscription).filter(
                Subscription.stripe_subscription_id == subscription_id
            ).first()
            
            if subscription:
                subscription.status = "canceled"
                subscription.canceled_at = datetime.utcnow()
                subscription.cancel_at_period_end = False
                db.commit()
                print(f"Subscription deactivated: {subscription_id} for anonymous_id: {anonymous_id}")
            else:
                # Create canceled record if doesn't exist
                subscription = Subscription(
                    stripe_subscription_id=subscription_id,
                    stripe_customer_id=data.get("customer"),
                    anonymous_id=anonymous_id,
                    status="canceled",
                    canceled_at=datetime.utcnow(),
                    meta_data=data.get("metadata", {})
                )
                db.add(subscription)
                db.commit()

        elif event_type == "invoice.payment_succeeded":
            print(f"Payment succeeded: {data['id']}")
            # TODO: Send receipt email
            # For now, log the invoice details
            customer_email = data.get("customer_email")
            amount_paid = data.get("amount_paid", 0) / 100  # Convert from cents
            print(f"Invoice paid: ${amount_paid:.2f} for customer: {customer_email}")
            # Email functionality can be added here using SES or SMTP

        elif event_type == "invoice.payment_failed":
            print(f"Payment failed: {data['id']}")
            # TODO: Send payment failure notification
            # For now, log the failure
            customer_email = data.get("customer_email")
            subscription_id = data.get("subscription")
            print(f"Payment failed for subscription: {subscription_id}, customer: {customer_email}")
            # Email functionality can be added here using SES or SMTP

    else:
        print(f"Unhandled event type: {event_type}")

    return {"received": True}


# Helper functions
async def get_or_create_customer(email: str, anonymous_id: Optional[str] = None):
    """Get existing customer or create new one."""
    customers = stripe.Customer.list(email=email, limit=1)
    
    if customers.data:
        # Update metadata if anonymous_id provided
        if anonymous_id:
            stripe.Customer.modify(
                customers.data[0].id,
                metadata={"anonymous_id": anonymous_id}
            )
        return customers.data[0]
    
    return stripe.Customer.create(
        email=email,
        metadata={"anonymous_id": anonymous_id or ""}
    )


async def get_customer_subscription_count(customer_id: str) -> int:
    """Count total subscriptions for a customer."""
    subscriptions = stripe.Subscription.list(
        customer=customer_id, status="all", limit=100
    )
    return len(subscriptions.data)


import logging
logger = logging.getLogger(__name__)
