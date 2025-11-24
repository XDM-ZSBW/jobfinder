# Privacy Policy

**Effective Date**: November 22, 2025  
**Last Updated**: November 22, 2025

## Introduction

Welcome to JobFinder (the "Platform"). We are committed to protecting your privacy and ensuring transparency about how we collect, use, and protect your personal information. This Privacy Policy explains our practices regarding data collection and your rights under applicable privacy laws, including the General Data Protection Regulation (GDPR) and California Consumer Privacy Act (CCPA).

## 1. Anonymous-First Architecture

JobFinder is designed with privacy at its core:

- **Anonymous by Default**: You can use most platform features without providing any personal information
- **Anonymous IDs**: We use anonymous identifiers that cannot be reverse-engineered to identify you
- **Zero-Knowledge Design**: The platform cannot correlate anonymous IDs to real identities
- **Optional Identity Linking**: You choose when and how to link your identity

## 2. Data We Collect

### 2.1 Information You Provide

**Anonymous Profile Data** (Optional):
- Skills and AI tool proficiencies
- Project portfolio information
- Experience summaries (free text)
- Assessment results

**Authentication Data** (If you choose to authenticate):
- Email address (for magic link authentication)
- Phone number (for SMS authentication)
- OAuth provider data (minimal: provider user ID, locale preference)

**User-Generated Content**:
- Forum posts and comments
- Marketplace listings
- Conversation history
- Canvas creations

### 2.2 Automatically Collected Data

**Technical Information**:
- IP addresses (hashed with SHA256 for security validation, deleted within 24 hours)
- Browser type and version
- Device information
- Session data

**Usage Data**:
- Pages visited
- Features used
- Time spent on platform
- Interaction patterns

### 2.3 Data We Do NOT Collect

We explicitly do not collect:
- Social Security Numbers (SSN)
- Credit card information (payment processing handled by third parties)
- Medical or health information
- Biometric data
- Precise geolocation data (only hashed IPs)
- Government-issued ID numbers
- Passwords (passwordless authentication)

## 3. How We Use Your Data

### 3.1 Core Platform Functions
- Provide job matching services
- Enable anonymous assessments
- Facilitate marketplace transactions
- Deliver authentication (magic links, SMS codes)
- Prevent fraud and abuse

### 3.2 AI Processing
- Generate job match recommendations
- Provide articulation assistance
- Moderate content for safety
- Detect bias in matching algorithms

### 3.3 Platform Improvement
- Analyze usage patterns (anonymized)
- Improve matching algorithms
- Enhance user experience
- Debug technical issues

### 3.4 Legal Compliance
- Respond to legal requests
- Enforce terms of service
- Protect user safety
- Prevent illegal activities

## 4. Data Sharing & Third Parties

### 4.1 Third-Party Services

We share minimal data with the following service providers:

**OpenAI (AI Processing)**:
- Purpose: AI-powered matching and articulation assistance
- Data Shared: User-generated content (anonymized), skill descriptions
- Location: United States
- Privacy Policy: https://openai.com/policies/privacy-policy

**Amazon SES (Email Delivery)**:
- Purpose: Send authentication emails (magic links)
- Data Shared: Email addresses (temporary, deleted after delivery)
- Location: United States
- Privacy Policy: https://aws.amazon.com/privacy/

**Twilio (SMS Delivery)**:
- Purpose: Send SMS verification codes
- Data Shared: Phone numbers (temporary, deleted after delivery)
- Location: United States
- Privacy Policy: https://www.twilio.com/legal/privacy

**OAuth Providers** (Google, Microsoft, Facebook, LinkedIn, Apple):
- Purpose: Social authentication
- Data Shared: Minimal (we receive provider user ID and locale only)
- Data Flow: You authenticate with provider, they send us minimal ID

### 4.2 No Data Sales

**We DO NOT**:
- Sell your personal information to third parties
- Share your data for advertising purposes
- Use your data for third-party marketing
- Rent or lease your information

### 4.3 Business Transfers

If JobFinder is acquired or merged, your data may be transferred to the new entity. You will be notified of any such change.

## 5. Data Retention & Deletion

### 5.1 Retention Periods

**Temporary Data**:
- Magic link tokens: 24 hours (auto-deleted)
- SMS verification codes: 10 minutes (auto-deleted)
- Email verification codes: 10 minutes (auto-deleted)
- Hashed IP addresses: 24 hours (auto-deleted)

**User Data**:
- Anonymous profiles: Retained until you request deletion
- Authentication links (email/phone): Not stored (in-memory only)
- Usage analytics: Anonymized and aggregated (cannot identify you)

### 5.2 Right to Deletion (GDPR/CCPA)

You have the right to request deletion of your data:

**How to Request Deletion**:
1. Contact us at privacy@jobmatch.zip
2. Provide your anonymous ID or authenticated email
3. We will process your request within 30 days

**What Gets Deleted**:
- Your anonymous profile and all linked data
- All assessment results
- Forum posts and comments
- Marketplace listings and transactions
- Conversation history
- All authentication data

**Exceptions**:
- We may retain data required for legal compliance
- Aggregated analytics (anonymized, cannot identify you)
- Backup archives (purged within 90 days)

## 6. Your Privacy Rights

### 6.1 GDPR Rights (EU Users)

If you are in the European Union, you have the right to:

- **Access**: Request a copy of your personal data
- **Rectification**: Correct inaccurate data
- **Erasure**: Request deletion of your data ("Right to be Forgotten")
- **Restriction**: Limit how we process your data
- **Portability**: Receive your data in machine-readable format
- **Object**: Object to certain processing activities
- **Withdraw Consent**: Withdraw consent at any time

### 6.2 CCPA Rights (California Users)

If you are a California resident, you have the right to:

- **Know**: What personal information we collect, use, and share
- **Delete**: Request deletion of your personal information
- **Opt-Out**: Opt-out of data sales (we don't sell data)
- **Non-Discrimination**: Equal service regardless of privacy choices

### 6.3 Exercising Your Rights

**Contact Methods**:
- Email: privacy@jobmatch.zip
- API Endpoint: DELETE /api/users/{anonymous_id}
- Response Time: Within 30 days

## 7. Data Security

### 7.1 Technical Safeguards

- **Encryption**: HTTPS/TLS for all data transmission
- **Hashing**: IP addresses hashed with SHA256
- **Rate Limiting**: Prevents brute force attacks
- **Security Headers**: CSP, HSTS, X-Frame-Options
- **Input Validation**: Prevents injection attacks

### 7.2 Organizational Safeguards

- Access controls and authentication
- Regular security audits
- Incident response procedures
- Employee training on data protection

### 7.3 Data Breach Notification

In the event of a data breach:
- We will notify you within 72 hours (GDPR requirement)
- Notification will include nature of breach and remediation steps
- We will notify relevant authorities as required by law

## 8. Children's Privacy (COPPA)

JobFinder is not intended for children under 13. We do not knowingly collect data from children. If we discover we have collected data from a child under 13, we will delete it immediately.

## 9. Cookies & Tracking

### 9.1 Cookies We Use

**Essential Cookies** (Required):
- Session management
- Authentication state
- Security (CSRF protection)

**Analytics Cookies** (Optional):
- Usage patterns (anonymized)
- Performance monitoring
- Feature usage tracking

### 9.2 Cookie Consent

You can manage cookie preferences through your browser settings. Disabling cookies may limit platform functionality.

### 9.3 Do Not Track

We respect Do Not Track (DNT) signals. If your browser sends DNT, we will not track your activity.

## 10. International Data Transfers

JobFinder operates primarily in the United States. If you access the platform from outside the US:

- Your data may be transferred to and stored in the US
- We comply with GDPR for EU users
- Standard Contractual Clauses (SCCs) used for EU transfers
- Adequate safeguards in place per GDPR Article 46

## 11. Privacy Policy Updates

We may update this Privacy Policy periodically. Changes will be communicated via:

- Email notification (if you provided email)
- Prominent notice on platform
- Updated "Last Modified" date

Continued use after changes constitutes acceptance.

## 12. Contact Us

**Data Controller**: JobFinder Platform

**Contact Information**:
- Email: privacy@jobmatch.zip
- Data Protection Officer: dpo@jobmatch.zip
- Address: [To be added before public launch]

**EU Representative**: [To be added if serving EU users]

**Supervisory Authority** (GDPR):
If you are in the EU and have concerns about our privacy practices, you may lodge a complaint with your local data protection authority.

## 13. California Shine the Light Law

California residents may request information about disclosure of personal information to third parties for direct marketing purposes. We do not disclose personal information for such purposes.

## 14. Nevada Privacy Rights

Nevada residents may opt-out of the sale of personal information. We do not sell personal information.

## 15. Compliance Certifications

- GDPR Compliant (EU General Data Protection Regulation)
- CCPA Compliant (California Consumer Privacy Act)
- COPPA Compliant (Children's Online Privacy Protection Act)

## 16. Glossary

**Anonymous ID**: Unique identifier that cannot be reverse-engineered to identify you  
**Personal Data**: Information that can identify you (email, phone, name)  
**Processing**: Any operation performed on data (collection, storage, deletion)  
**Data Controller**: Entity determining purposes of data processing (JobFinder)  
**Data Processor**: Entity processing data on behalf of controller (third parties)

---

**Questions or Concerns?**  
Contact us at privacy@jobmatch.zip

**Last Reviewed**: November 22, 2025
