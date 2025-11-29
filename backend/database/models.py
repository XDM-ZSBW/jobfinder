"""
SQLAlchemy database models.
"""
from datetime import datetime
from decimal import Decimal
from sqlalchemy import Column, String, DateTime, Text, Integer, Boolean, JSON, ForeignKey, Index, Numeric
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()


class AnonymousUser(Base):
    """Anonymous user identity."""
    __tablename__ = "anonymous_users"
    
    id = Column(String(255), primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    last_active = Column(DateTime, default=datetime.utcnow, nullable=False)
    meta_data = Column("metadata", JSON, nullable=True)  # Database column name stays 'metadata', but Python attribute is 'meta_data' to avoid SQLAlchemy reserved name conflict
    
    # Relationships
    profiles = relationship("LLCProfile", back_populates="user")
    assessments = relationship("CapabilityAssessment", back_populates="user")
    matches = relationship("Match", back_populates="user")


class LLCProfile(Base):
    """LLC owner profile (anonymous, skill-focused)."""
    __tablename__ = "llc_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(255), ForeignKey("anonymous_users.id"), nullable=False, index=True)
    skills = Column(JSON, nullable=False)  # List of AI tools and capabilities
    projects = Column(JSON, nullable=True)  # Portfolio projects
    experience_summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("AnonymousUser", back_populates="profiles")


class CapabilityAssessment(Base):
    """AI capability test results."""
    __tablename__ = "capability_assessments"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(255), ForeignKey("anonymous_users.id"), nullable=False, index=True)
    assessment_type = Column(String(50), nullable=False)  # e.g., "ai_tool_proficiency"
    results = Column(JSON, nullable=False)
    checkpoint_id = Column(Integer, nullable=True)  # Link to state checkpoint
    human_reviewed = Column(Boolean, default=False, nullable=False)
    human_reviewer_id = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("AnonymousUser", back_populates="assessments")


class Match(Base):
    """Job seeker/opportunity matches."""
    __tablename__ = "matches"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(255), ForeignKey("anonymous_users.id"), nullable=False, index=True)
    job_posting_id = Column(Integer, ForeignKey("job_postings.id"), nullable=False, index=True)
    match_score = Column(Integer, nullable=False)  # 0-100 (final combined score)
    compatibility_score = Column(Integer, nullable=True)  # 0-100 (immediate skill fit)
    longevity_score = Column(Integer, nullable=True)  # 0-100 (predicted engagement duration)
    predicted_months = Column(Integer, nullable=True)  # Predicted engagement in months
    longevity_factors = Column(JSON, nullable=True)  # Contributing longevity factors
    match_reasons = Column(JSON, nullable=True)  # Why this match was made
    human_reviewed = Column(Boolean, default=False, nullable=False)
    human_reviewer_id = Column(String(255), nullable=True)
    human_feedback = Column(Text, nullable=True)
    checkpoint_id = Column(Integer, nullable=True)  # Link to state checkpoint
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("AnonymousUser", back_populates="matches")
    job_posting = relationship("JobPosting", back_populates="matches")
    
    __table_args__ = (
        Index('idx_user_job', 'user_id', 'job_posting_id'),
    )


class JobPosting(Base):
    """Anonymous job postings."""
    __tablename__ = "job_postings"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    required_skills = Column(JSON, nullable=False)  # List of required AI capabilities
    preferred_skills = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    active = Column(Boolean, default=True, nullable=False)
    
    # Relationships
    matches = relationship("Match", back_populates="job_posting")


class HumanReview(Base):
    """Human reviewer decisions and feedback."""
    __tablename__ = "human_reviews"
    
    id = Column(Integer, primary_key=True, index=True)
    review_type = Column(String(50), nullable=False)  # matching, assessment, moderation
    entity_id = Column(String(255), nullable=False, index=True)
    reviewer_id = Column(String(255), nullable=False)
    decision = Column(String(50), nullable=False)  # approved, rejected, needs_revision
    feedback = Column(Text, nullable=True)
    meta_data = Column("metadata", JSON, nullable=True)  # Database column name stays 'metadata', but Python attribute is 'meta_data' to avoid SQLAlchemy reserved name conflict
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class ArticulationSuggestion(Base):
    """AI-generated language suggestions (versioned)."""
    __tablename__ = "articulation_suggestions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(255), ForeignKey("anonymous_users.id"), nullable=False, index=True)
    original_text = Column(Text, nullable=False)
    suggested_text = Column(Text, nullable=False)
    version = Column(Integer, default=1, nullable=False)
    checkpoint_id = Column(Integer, nullable=True)
    human_refined = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class ForumPost(Base):
    """Forum discussion posts."""
    __tablename__ = "forum_posts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(255), ForeignKey("anonymous_users.id"), nullable=False, index=True)
    forum_topic = Column(String(100), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    parent_post_id = Column(Integer, ForeignKey("forum_posts.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    
    # Relationships
    parent = relationship("ForumPost", remote_side=[id])


class Referral(Base):
    """Referral tracking for viral growth."""
    __tablename__ = "referrals"
    
    id = Column(Integer, primary_key=True, index=True)
    referrer_id = Column(String(255), ForeignKey("anonymous_users.id"), nullable=False, index=True)
    referred_id = Column(String(255), ForeignKey("anonymous_users.id"), nullable=False, index=True)
    referral_code = Column(String(50), nullable=False, unique=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class MarketplaceListing(Base):
    """Product/Service listings for marketplace."""
    __tablename__ = "marketplace_listings"
    
    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(String(255), unique=True, nullable=False, index=True)
    seller_id = Column(String(255), ForeignKey("anonymous_users.id"), nullable=False, index=True)
    listing_type = Column(String(50), nullable=False, index=True)  # asset, capability, combined
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    asset_details = Column(JSON, nullable=True)
    capability_details = Column(JSON, nullable=True)
    pricing = Column(JSON, nullable=False)
    valuation = Column(JSON, nullable=True)
    status = Column(String(50), nullable=False, default="draft", index=True)
    checkpoint_id = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    expires_at = Column(DateTime, nullable=True)


class MarketplaceTransaction(Base):
    """Payment transactions in marketplace."""
    __tablename__ = "marketplace_transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(String(255), unique=True, nullable=False, index=True)
    buyer_id = Column(String(255), ForeignKey("anonymous_users.id"), nullable=False, index=True)
    seller_id = Column(String(255), ForeignKey("anonymous_users.id"), nullable=False, index=True)
    listing_id = Column(String(255), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    platform_fee = Column(Numeric(10, 2), nullable=False)
    seller_payout = Column(Numeric(10, 2), nullable=False)
    payment_method = Column(String(50), nullable=False)
    payment_provider_transaction_id = Column(String(255), nullable=True)
    status = Column(String(50), nullable=False, default="pending", index=True)
    human_reviewed = Column(Boolean, default=False, nullable=False)
    reviewer_id = Column(String(255), nullable=True)
    checkpoint_id = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    processed_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)


class EscrowAccount(Base):
    """Escrow accounts for large transactions."""
    __tablename__ = "escrow_accounts"
    
    id = Column(Integer, primary_key=True, index=True)
    escrow_id = Column(String(255), unique=True, nullable=False, index=True)
    buyer_id = Column(String(255), ForeignKey("anonymous_users.id"), nullable=False, index=True)
    seller_id = Column(String(255), ForeignKey("anonymous_users.id"), nullable=False, index=True)
    transaction_id = Column(String(255), nullable=True)
    amount = Column(Numeric(10, 2), nullable=False)
    status = Column(String(50), nullable=False, default="held", index=True)
    release_conditions = Column(JSON, nullable=False)
    human_reviewed = Column(Boolean, default=False, nullable=False)
    reviewer_id = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    released_at = Column(DateTime, nullable=True)


class MarketplaceOrder(Base):
    """Orders in marketplace."""
    __tablename__ = "marketplace_orders"
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(String(255), unique=True, nullable=False, index=True)
    transaction_id = Column(String(255), nullable=False)
    buyer_id = Column(String(255), ForeignKey("anonymous_users.id"), nullable=False, index=True)
    seller_id = Column(String(255), ForeignKey("anonymous_users.id"), nullable=False, index=True)
    listing_id = Column(String(255), nullable=False)
    order_details = Column(JSON, nullable=False)
    delivery_type = Column(String(50), nullable=False)  # digital, physical, service
    delivery_status = Column(String(50), nullable=False, default="pending", index=True)
    tracking_info = Column(JSON, nullable=True)
    human_reviewed = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    delivered_at = Column(DateTime, nullable=True)


class MarketplaceDispute(Base):
    """Disputes in marketplace."""
    __tablename__ = "marketplace_disputes"
    
    id = Column(Integer, primary_key=True, index=True)
    dispute_id = Column(String(255), unique=True, nullable=False, index=True)
    transaction_id = Column(String(255), nullable=False)
    order_id = Column(String(255), nullable=True)
    initiator_id = Column(String(255), ForeignKey("anonymous_users.id"), nullable=False)
    reason = Column(Text, nullable=False)
    status = Column(String(50), nullable=False, default="open", index=True)
    human_reviewer_id = Column(String(255), nullable=True)
    resolution = Column(Text, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class SellerProfile(Base):
    """Seller profiles for marketplace."""
    __tablename__ = "seller_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(255), ForeignKey("anonymous_users.id"), nullable=False, unique=True, index=True)
    business_name = Column(String(255), nullable=True)
    business_type = Column(String(50), nullable=True)  # llc, sole_proprietor
    verification_status = Column(String(50), nullable=False, default="unverified", index=True)
    total_sales = Column(Numeric(10, 2), nullable=False, default=0)
    total_transactions = Column(Integer, nullable=False, default=0)
    rating = Column(Numeric(3, 2), nullable=True)
    meta_data = Column("metadata", JSON, nullable=True)  # Database column name stays 'metadata', but Python attribute is 'meta_data' to avoid SQLAlchemy reserved name conflict
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class Conversation(Base):
    """Conversation storage for assessment and other chat flows."""
    __tablename__ = "conversations"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(255), nullable=False, unique=True, index=True)
    user_id = Column(String(255), ForeignKey("anonymous_users.id"), nullable=True, index=True)
    conversation_type = Column(String(50), nullable=False, default="assessment")  # assessment, xdmiq, etc.
    messages = Column(JSON, nullable=False)  # Array of message objects
    meta_data = Column("metadata", JSON, nullable=True)  # Database column name stays 'metadata', but Python attribute is 'meta_data' to avoid SQLAlchemy reserved name conflict
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("AnonymousUser", foreign_keys=[user_id])
    
    __table_args__ = (
        Index('idx_conversations_session', 'session_id'),
        Index('idx_conversations_user', 'user_id'),
        Index('idx_conversations_type', 'conversation_type'),
    )


class Subscription(Base):
    """Stripe subscription tracking for anonymous users."""
    __tablename__ = "subscriptions"
    
    id = Column(Integer, primary_key=True, index=True)
    anonymous_id = Column(String(255), ForeignKey("anonymous_users.id"), nullable=True, index=True)
    stripe_subscription_id = Column(String(255), unique=True, nullable=False, index=True)
    stripe_customer_id = Column(String(255), nullable=True, index=True)
    stripe_checkout_session_id = Column(String(255), nullable=True, index=True)
    status = Column(String(50), nullable=False, default="active", index=True)  # active, canceled, past_due, unpaid, trialing
    current_period_start = Column(DateTime, nullable=True)
    current_period_end = Column(DateTime, nullable=True)
    cancel_at_period_end = Column(Boolean, default=False, nullable=False)
    canceled_at = Column(DateTime, nullable=True)
    email = Column(String(255), nullable=True, index=True)
    meta_data = Column("metadata", JSON, nullable=True)  # Store additional Stripe metadata
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("AnonymousUser", foreign_keys=[anonymous_id])
    
    __table_args__ = (
        Index('idx_subscriptions_anonymous_id', 'anonymous_id'),
        Index('idx_subscriptions_status', 'status'),
        Index('idx_subscriptions_stripe_id', 'stripe_subscription_id'),
    )


class CreditRequest(Base):
    """Credit/refund requests for subscriptions."""
    __tablename__ = "credit_requests"
    
    id = Column(Integer, primary_key=True, index=True)
    subscription_id = Column(String(255), nullable=False, index=True)
    anonymous_id = Column(String(255), ForeignKey("anonymous_users.id"), nullable=True, index=True)
    email = Column(String(255), nullable=False, index=True)
    reason = Column(Text, nullable=False)
    status = Column(String(50), nullable=False, default="pending", index=True)  # pending, approved, rejected, processed
    days_since_start = Column(Integer, nullable=True)
    admin_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    processed_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("AnonymousUser", foreign_keys=[anonymous_id])


