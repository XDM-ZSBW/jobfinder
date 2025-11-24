# JobFinder Public MVP: 15-Minute Task Marketplace

## Public-Facing Concept

**Tagline**: "Instant, rational matches for 15-60 minute tasks"

**What We Say Publicly**:
- A capability-based task marketplace for short, bounded tasks
- Match based on what you can do RIGHT NOW, not credentials
- Safe, SFW, time-boxed help to get one thing done
- "Would work with again" signals drive match quality

**What We Don't Say (Yet)**:
- LLC owner focus
- AI worker capabilities
- Longevity prediction algorithms
- Multi-year engagement thesis

## Atomic Unit to Validate

**One successful interaction loop:**

1. **Helper creates capability card**
   - "I can do X"
   - "For Y minutes" (15/30/60/120)
   - "Available: now / within 2 hours / this week"

2. **Requester posts task**
   - "What needs doing in next 2 hours?"
   - Time estimate
   - Async vs live preference

3. **System matches**
   - Capability-task similarity (keywords + categories)
   - Availability overlap
   - Past "would work again" ratings

4. **Interaction completes**
   - Built-in messaging (no file exchange v0)
   - Payment external (mention preferred method)
   - Task gets done

5. **Feedback collected**
   - Did task get done? (yes/no)
   - Would you work with this person again? (1-5)
   - How long did it take?

## MVP Feature Slice

### Phase 1: Wizard-of-Oz (Manual Matching)

**Goal**: Validate demand before building AI

**Launch**:
- Landing page with waitlist form
- Google Form for capability cards
- Manual email-based matching (you personally)
- Track if people complete tasks
- Collect "would work again" signals

**Success Metric**: 10 completed task loops with 80%+ positive feedback

### Phase 2: Minimal Automation

**Only if Phase 1 validates demand:**

**Capability Card Creator** (`/helper/create`)
```
What can you help with?
- [Text area: 200 chars]

How long can you commit?
- ○ 15 minutes
- ○ 30 minutes  
- ○ 60 minutes
- ○ 2 hours

When are you available?
- ○ Right now
- ○ Within next 2 hours
- ○ This week (flexible)

Preferred interaction:
- ☐ Text chat
- ☐ Voice call
- ☐ Video call
- ☐ Async (email/docs)

[Create Capability Card]
```

**Task Request Form** (`/request/create`)
```
What needs to get done?
- [Text area: 300 chars]

How long do you think it takes?
- ○ 15 minutes
- ○ 30 minutes
- ○ 60 minutes
- ○ 2+ hours (we'll break it down)

When do you need it done?
- ○ In the next hour
- ○ Within 2 hours
- ○ Today
- ○ This week

Preferred interaction:
- ☐ Text chat
- ☐ Voice call
- ☐ Video call
- ☐ Async (email/docs)

[Post Task]
```

**Simple Matching Screen** (`/matches`)
```
Your task: "Debug this SQL query"

Top 3 Matches:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Helper #42A7
Can help with: SQL debugging, performance tuning
Available: Right now (next 30 minutes)
Past successes: 12 tasks, 4.8★ "would work again"
Time estimate: 20-30 minutes

[Connect with Helper #42A7]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Show More Matches]
```

**Messaging Interface** (`/task/{id}/chat`)
```
Task: Debug SQL query
Helper: #42A7
Started: 2:15 PM

[Simple chat interface]
[No file upload v0 - paste code as text]
[Timer showing elapsed time]

[Mark Task Complete]
```

**Feedback Form** (auto-shows after "Mark Complete")
```
Quick feedback (15 seconds):

1. Did the task get done?
   ○ Yes, completely
   ○ Partially
   ○ No

2. Would you work with Helper #42A7 again?
   ★☆☆☆☆ (1-5 stars)

3. How long did it actually take?
   [Auto-filled: 22 minutes] [Edit]

Optional: What went well? What could improve?
[Text area: 100 chars]

[Submit Feedback]
```

## Safety & Policy

**Onboarding Screen** (before first use):
```
JobFinder is for SFW, professional tasks only

Not allowed:
❌ NSFW content or requests
❌ Harassment or abuse
❌ Illegal activities
❌ Personal relationship requests
❌ Financial advice (unless licensed)
❌ Medical advice (unless licensed)

Allowed:
✅ Research & data gathering
✅ Debugging & coding help
✅ Writing & editing
✅ Design feedback
✅ Brainstorming
✅ Learning & explaining

☐ I agree to use JobFinder for SFW professional tasks only

[Continue]
```

**Flag Button** (on every page):
```
[🚩 Report Inappropriate Content]
```

## Public Messaging

### Landing Page Copy

**Hero Section:**
```
Get Help Now. Help Others Later.

The task marketplace that matches based on capabilities, not credentials.

• 15-60 minute tasks
• Instant, rational matching
• Safe, SFW, focused work

[Post Your First Task] [Offer to Help]
```

**How It Works:**
```
1. Describe what you need (or what you can do)
2. Get matched with someone available now
3. Complete the task together
4. Rate the experience

No resumes. No credentials. Just capabilities.
```

**FAQ:**
```
Q: What kinds of tasks?
A: Anything that fits in 15-60 minutes: debugging code, 
   researching a topic, editing a document, explaining a 
   concept, brainstorming ideas.

Q: How much does it cost?
A: Helpers set their own rates. Many tasks are free 
   (people helping each other learn). Payment happens 
   outside the platform for now.

Q: Is it safe?
A: Strict SFW policy. Flag button on every page. 
   No file exchange in v0 (text only). You control 
   what information you share.

Q: What makes a good match?
A: Matches that lead to "would work with again" ratings 
   appear first. Over time, the system learns what works.
```

## Internal Tracking (Hidden from Public)

**Behind the scenes, you're collecting:**
- Capability diversity (are LLC owners showing up?)
- Task longevity signals (do they come back for more?)
- Skill progression (are helpers growing?)
- Repeat collaboration rates (proxy for engagement)

**This validates your longevity thesis without revealing it.**

## Technical Implementation Path

### Week 1-2: Wizard of Oz
- Landing page + waitlist
- Google Forms for intake
- Manual email matching
- Track completion rates

### Week 3-4: If validated (10+ completions)
- Basic auth (anonymous IDs)
- Capability card DB
- Task request DB
- Simple keyword matching
- Built-in messaging

### Week 5-6: If still working
- Rating system
- Match ranking by past ratings
- Availability filtering
- Basic analytics dashboard

### Week 7+: Scale decisions
- Auto-matching algorithm
- Payment integration
- Mobile optimization
- Longevity prediction (internal only)

## Success Metrics

**Phase 1 (Wizard of Oz):**
- 50+ signups on waitlist
- 10+ completed task loops
- 80%+ "would work again" ratings
- 50%+ come back for second task

**Phase 2 (Minimal Automation):**
- 100+ capability cards created
- 50+ tasks posted
- 30+ matches completed
- Average task time matches estimate

**Phase 3 (Validated Product):**
- 500+ active users
- 200+ tasks/week
- 70%+ completion rate
- 60%+ repeat collaboration

## What You Have Today

From JobFinder codebase:
- ✅ Anonymous-first architecture
- ✅ Next.js frontend
- ✅ FastAPI backend
- ✅ Auth system
- ✅ Universal Canvas (low-bandwidth)
- ✅ State recovery system

**You can repurpose:**
- Canvas → Capability card creator
- Assessment flow → Task request form
- Matching engine → Simple keyword matcher
- Compliance system → SFW policy enforcement

## Next Concrete Step

**Option A: Wizard of Oz (2 hours work)**
1. Create landing page with Typeform embed
2. Post to Reddit/HN: "I'll manually match you for free"
3. Do 10 manual matches via email
4. Track: did tasks complete? would they repeat?

**Option B: Minimal Frontend (2 days work)**
1. `/helper/create` - Capability card form
2. `/request/create` - Task request form
3. `/matches` - Show 3 matches (you manually curate first 50)
4. `/chat` - Simple text messaging
5. Feedback collection

**Which would you like me to build first?**
