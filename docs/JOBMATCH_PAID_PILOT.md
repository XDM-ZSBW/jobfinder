# JobMatch.zip: Paid Pilot Launch Strategy

## Positioning: Pre-Sold Beta for Early Adopters

**NOT a free experiment. NOT a platform. A PAID SERVICE.**

### What We're Selling

**"We match you with a rational human who actually has the capability you need, for a focused 45-60 minute working session, within 24 hours."**

**Target**: LLC owners and AI-native independents who waste time on bad fits, credential gatekeeping, and flaky short gigs.

**Promise**: Reduce time-to-progress on concrete tasks (LLC/AI ops, automation, prompts, architecture, debugging) through capability-first matching.

## Pricing Structure

### Pilot Offer (Early Adopter Pricing)

**Single Session**: $49
- 45-60 minute matched working session
- Within 24 hours of booking
- "Zero value? Pay only $24 (half) or get a redo" guarantee
- Founder-led curation of match

**JobMatch Sprint (3 Sessions)**: $129 (save $18)
- Three 45-60 minute sessions
- Use within 30 days
- Same guarantee per session
- Priority matching
- **Limited to 50 seats** for beta

**Why This Works**:
- Real money = serious validation
- Low enough to be impulse purchase for target market
- Guarantee de-risks for buyer
- Bundle creates commitment & repeat signal
- "Limited seats" creates urgency

### Founder Benefits Frame

**Early adopters get:**
- ✅ Locked-in lower pricing forever
- ✅ Direct influence on roadmap
- ✅ First access to new features
- ✅ Founder-curated matches (highest quality)
- ✅ Beta badge / recognition

## Terminal-Only Frontend (jobmatch.zip)

### Why Terminal?

- **Fastest to build** - Pure text, no CSS/JS complexity
- **Matches target market** - LLC/AI natives comfortable with terminal
- **Forces focus** - No feature creep
- **Low bandwidth** - Works anywhere (aligns with Yourl.Cloud global access)
- **POC perfect** - Validate willingness to pay before polish

### Access Flow

```
1. User visits: https://jobmatch.zip
2. Sees landing page: "Terminal-based capability matching"
3. Clicks "Book Session ($49)" → Stripe Checkout
4. After payment → Receives SSH credentials via email
5. SSH into session: ssh match@jobmatch.zip -p 2222
6. Terminal interface walks them through:
   - Capability assessment
   - Task description
   - Match notification
   - Session scheduling
```

### Terminal UI Example

```
╔══════════════════════════════════════════════════════════╗
║              JOBMATCH.ZIP - Session #42A7                ║
║  Capability-First Matching | Beta Access Confirmed      ║
╚══════════════════════════════════════════════════════════╝

Welcome! You've purchased a JobMatch session.

Let's find your best match in 3 steps:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 1: What capability do you need?

Examples:
• Debug Python FastAPI endpoint
• Review AI prompt engineering strategy
• Explain Kubernetes deployment
• Brainstorm LLC business structure
• Automate data pipeline with n8n

Your task (200 chars max):
> _

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Press Enter to continue]
```

### Technical Implementation

**Stack**:
- Python `cmd` module for terminal UI
- SSH server (OpenSSH + Python script)
- Redis for session state
- PostgreSQL for match data
- Stripe webhook for payment confirmation

**Flow**:
1. Stripe payment → webhook → creates account + session token
2. Email sent with SSH credentials
3. User SSHs in → Python CLI loads their session
4. Walk through assessment → save to DB
5. Founder gets notification → manually curates match
6. User SSHs back in → sees match + scheduling link
7. Session happens (external: Zoom/Google Meet)
8. Post-session: SSH back in for feedback form

## Landing Page (jobmatch.zip)

### Hero Section

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
         JOBMATCH.ZIP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Capability-First Matching for LLC Owners & AI Natives

Stop wasting time on bad fits and credential gatekeeping.

Get matched with someone who can actually help—within 24 hours.

[Book Your First Session - $49]  [Get 3-Session Sprint - $129]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Problem → Solution

```
THE PROBLEM:

❌ Job boards focus on credentials, not capabilities
❌ Freelance platforms are full of flaky gigs
❌ "Networking" wastes hours on poor fits
❌ AI can't evaluate who actually knows their stuff

THE SOLUTION:

✅ Describe the task you need help with right now
✅ We match you with someone who has that capability
✅ 45-60 minute focused working session
✅ Within 24 hours, guaranteed
✅ "Longest-lasting matches first" ranking

NO RESUMES. NO CREDENTIALS. JUST CAPABILITIES.
```

### How It Works

```
1. Book a Session
   Pay $49 (or $129 for 3-session sprint)
   Early adopter pricing - locks in forever

2. Get Matched (Within 24 Hours)
   SSH into our terminal interface
   Tell us what you need help with
   We find your best capability match

3. Work Together
   45-60 minute focused session
   Video/voice/chat - your choice
   Get real progress on your task

4. Rate & Repeat
   Quick feedback helps future matches
   50%+ of pilots book again within 7 days
```

### What You Get

```
INCLUDED IN EVERY SESSION:

• Founder-curated capability matching
• 45-60 minute working session
• Within 24-hour match guarantee
• Zero-value guarantee (pay half or redo)
• Terminal-based coordination
• Beta access to upcoming features

EARLY ADOPTER BENEFITS:

• Locked-in pricing (never goes up)
• Direct roadmap influence
• Priority matching
• First access to automation
• Founder recognition
```

### FAQ

```
Q: Why terminal-based?
A: Our target market (LLC/AI natives) is terminal-comfortable.
   It's fast, focused, and works on any connection.
   Plus: we're testing core matching before polish.

Q: What if I'm not matched well?
A: You pay only $24 (half) or get a free redo.
   We're beta testing, so quality is paramount.

Q: How do sessions happen?
A: After matching in terminal, you schedule via
   Calendly link. Sessions are Zoom/Meet/whatever works.

Q: What tasks work best?
A: Bounded, 45-60 minute chunks:
   • Debug something specific
   • Review/feedback on work
   • Explain a concept
   • Brainstorm approach
   • Pair on implementation

Q: Is this just job search?
A: No - this is capability matching for immediate help,
   not long-term employment. Though repeat matches often
   lead to longer engagements.
```

### CTA

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

LIMITED BETA: ONLY 50 EARLY ADOPTER SEATS

[Book Single Session - $49]

[Get 3-Session Sprint - $129] ← Best Value

✅ Within 24 hours matching
✅ Zero-value guarantee
✅ Founder-curated quality
✅ Price locked in forever

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Stripe Integration

### Products

```python
# Single Session
stripe.Product.create(
    name="JobMatch Session",
    description="45-60 minute capability-matched working session",
    metadata={
        "type": "single_session",
        "sessions": "1"
    }
)

stripe.Price.create(
    product=product_id,
    unit_amount=4900,  # $49.00
    currency="usd",
)

# 3-Session Sprint
stripe.Product.create(
    name="JobMatch Sprint (3 Sessions)",
    description="Three 45-60 minute sessions, use within 30 days",
    metadata={
        "type": "sprint",
        "sessions": "3"
    }
)

stripe.Price.create(
    product=product_id,
    unit_amount=12900,  # $129.00
    currency="usd",
)
```

### Webhook Flow

```python
@app.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    event = stripe.Webhook.construct_event(
        payload=await request.body(),
        sig_header=request.headers.get("stripe-signature"),
        secret=settings.STRIPE_WEBHOOK_SECRET
    )
    
    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        
        # Create user account
        user = create_anonymous_user(
            email=session["customer_details"]["email"],
            session_count=session["metadata"]["sessions"]
        )
        
        # Generate SSH credentials
        ssh_user, ssh_pass = generate_ssh_creds(user.id)
        
        # Send welcome email
        send_email(
            to=user.email,
            subject="Welcome to JobMatch.zip Beta",
            template="welcome_ssh",
            ssh_user=ssh_user,
            ssh_pass=ssh_pass
        )
        
    return {"status": "success"}
```

## Connection to XDMIQ Ecosystem

### Internal Data Flow

**JobMatch.zip** (front door - collects cash):
- Validates: people will pay for capability matching
- Collects: "would work again" signals = longevity data
- Feeds: match quality data to XDMIQ assessment engine

**XDMIQ.com** (assessment infrastructure):
- Powers: capability evaluation behind JobMatch
- Uses: session data to improve longevity predictions
- Validates: "longest-lasting match" thesis

**Yourl.Cloud** (state persistence):
- Stores: working session artifacts
- Enables: context reuse in future matches
- Demonstrates: "sessions live and can be resumed"

### Public Narrative

"JobMatch.zip is where you experience capability-first matching in under an hour. Behind it, XDMIQ's assessment infrastructure powers smarter matches, and Yourl.Cloud preserves your work context for future sessions. We're building the operating system for rational, AI-native work."

## Launch Timeline

### Week 1: Build Terminal MVP
- [ ] Landing page with Stripe checkout
- [ ] SSH server setup
- [ ] Terminal CLI for assessment
- [ ] Email automation
- [ ] Founder notification system

### Week 2: Manual Matching (Wizard of Oz)
- [ ] Launch to small email list (50 people)
- [ ] Take first 10 paid sessions
- [ ] Manually curate matches
- [ ] Track: completion rate, "would work again", time to match

### Week 3-4: Refine & Scale
- [ ] If 8/10 complete successfully → open to 50 seats
- [ ] If <6/10 complete → iterate matching process
- [ ] Collect testimonials from successful matches
- [ ] Build feedback loop into terminal UI

### Week 5+: Automate or Pivot
- **If working**: Build auto-matching algorithm
- **If not**: Adjust offer/positioning based on learnings

## Success Metrics

### Phase 1 (First 10 Paid Sessions)
- [ ] 8/10+ sessions complete successfully
- [ ] 4/10+ rate "would work again" at 4-5 stars
- [ ] Average time-to-match < 12 hours
- [ ] 3/10+ book second session within 7 days

### Phase 2 (First 50 Seats)
- [ ] $2,450+ revenue (50 × $49 minimum)
- [ ] 70%+ completion rate
- [ ] 60%+ positive "would work again"
- [ ] 40%+ repeat purchase rate

### Phase 3 (Validated & Scaling)
- [ ] $10K+ MRR from repeat sessions
- [ ] Automate 80% of matching
- [ ] Launch "capability provider" application
- [ ] Build upgrade path to XDMIQ enterprise

## Next Immediate Actions

1. **Set up Stripe account** for JobMatch.zip
2. **Build landing page** with checkout buttons
3. **Set up SSH server** on existing infrastructure
4. **Build Python terminal CLI** for assessment
5. **Launch to 50-person email list**

**Time to first dollar: 48 hours**

---

**JobMatch.zip: Where capability-first matching becomes revenue.** 💰
