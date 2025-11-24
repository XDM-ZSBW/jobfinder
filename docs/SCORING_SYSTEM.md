# JobMatch AI - Quality Scoring System

## Overview
Jobs are scored 0-100 based on posting quality and legitimacy. A score of 100 means it's a fresh, real, high-quality job posting.

## Scoring Factors

### Base Score: 50 points
All jobs start with a neutral score of 50.

### Factor 1: Legitimacy (+30 / -20 points)
- **+30 points** if the job is legitimate
- **-20 points** if the job appears to be a scam, spam, or illegitimate

### Factor 2: Red Flags (-5 points per flag, max -25 points)
Each red flag found deducts 5 points (capped at 25 total):
- Vague or missing job descriptions
- Unrealistic salary ranges
- Non-corporate email domains (Gmail, Yahoo for businesses)
- Urgency language ("immediate need", "start today")
- Requests for personal info upfront (SSN, bank info)
- Poor grammar or unprofessional language
- Missing company details

### Factor 3: Description Detail (+10 / +20 points)
- **+20 points** if description is > 1000 characters (detailed)
- **+10 points** if description is > 500 characters (moderate detail)
- **0 points** if description is < 500 characters

### Factor 4: Company Info (+10 points)
- **+10 points** if company name is present and not "Unknown Company"

### Factor 5: Title Presence (+10 points)
- **+10 points** if job title is present and not "Unknown Title"

### Factor 6: Quality Bonus (+10 points)
- **+10 points** bonus for legitimate, detailed, complete postings
  - Requires: isLegitimate = true AND description > 1000 chars AND company present

## Final Score Calculation

```javascript
let qualityScore = 50; // Base

// Factor 1: Legitimacy
if (legitimate) qualityScore += 30; else qualityScore -= 20;

// Factor 2: Red flags (max -25)
qualityScore -= Math.min(redFlags.length * 5, 25);

// Factor 3: Description detail
if (descriptionLength > 1000) qualityScore += 20;
else if (descriptionLength > 500) qualityScore += 10;

// Factor 4: Company info
if (hasCompany) qualityScore += 10;

// Factor 5: Title presence
if (hasTitle) qualityScore += 10;

// Factor 6: Quality bonus
if (legitimate && descriptionLength > 1000 && hasCompany) qualityScore += 10;

// Clamp to 0-100
qualityScore = Math.max(0, Math.min(100, qualityScore));
```

## Example Scores

### High Quality Job (Score: 100)
- ✅ Legitimate (+30)
- ✅ No red flags (0)
- ✅ Detailed description > 1000 chars (+20)
- ✅ Company name present (+10)
- ✅ Job title present (+10)
- ✅ Quality bonus (+10)
- **Total: 100**

### Good Quality Job (Score: 80)
- ✅ Legitimate (+30)
- ✅ No red flags (0)
- ✅ Moderate description > 500 chars (+10)
- ✅ Company name present (+10)
- ✅ Job title present (+10)
- **Total: 80**

### Average Job (Score: 70)
- ✅ Legitimate (+30)
- ✅ No red flags (0)
- ✅ Moderate description > 500 chars (+10)
- ✅ Company name present (+10)
- ✅ Job title present (+10)
- **Total: 70**

### Below Average Job (Score: 40)
- ❌ Not legitimate (-20)
- ✅ No red flags (0)
- ⚠️ Short description < 500 chars (0)
- ✅ Company name present (+10)
- ✅ Job title present (+10)
- **Total: 40**

### Low Quality Job (Score: 15)
- ❌ Not legitimate (-20)
- ❌ 3 red flags (-15)
- ⚠️ Short description < 500 chars (0)
- ❌ No company name (0)
- ⚠️ Generic title (0)
- **Total: 15**

### Scam Job (Score: 0)
- ❌ Not legitimate (-20)
- ❌ 6 red flags (-25, max)
- ❌ No description or very short (0)
- ❌ No company name (0)
- ❌ No job title or generic (0)
- **Total: 5 (clamped to 0)**

## AI Analysis Failure Handling

If the AI analysis fails due to model errors:
- Returns safe defaults: `isLegitimate: true, redFlags: []`
- Ensures jobs still get scored (minimum base score of 50)
- Adds suggestion: "Unable to analyze job posting automatically"

