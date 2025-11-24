# Yourl.cloud Brand Guidelines

## Official Logo

**Primary Logo**: Horizontal wordmark with integrated cloud icon
- The "o" in "yourl" is stylized as a blue cloud
- Clean, professional design suitable for all communications
- Works for domain name related content, emails, and website

## Logo Usage

### Do's ✅
- Use the official logo file provided
- Maintain clear space around the logo (minimum 20px)
- Use on white or light backgrounds for optimal visibility
- Scale proportionally - never stretch or distort
- Use for email signatures, headers, and website navigation
- Apply to domain-related marketing materials

### Don'ts ❌
- Don't alter the colors
- Don't rotate or flip the logo
- Don't add effects (shadows, gradients, outlines)
- Don't place on busy backgrounds without a solid backing
- Don't separate the cloud icon from the text
- Don't recreate or approximate the logo

## Color Palette

### Primary Colors
- **Cloud Blue**: #3B82F6 (RGB: 59, 130, 246)
- **Text Dark**: #1F2937 (RGB: 31, 41, 55)
- **Background White**: #FFFFFF (RGB: 255, 255, 255)

### Supporting Colors
- **Sky Blue**: #60A5FA (RGB: 96, 165, 250)
- **Deep Blue**: #2563EB (RGB: 37, 99, 235)
- **Light Gray**: #F3F4F6 (RGB: 243, 244, 246)
- **Medium Gray**: #6B7280 (RGB: 107, 114, 128)

## Typography

### Primary Font
**Sans-serif** (system fonts for web/email):
- macOS/iOS: `-apple-system, BlinkMacSystemFont`
- Windows: `Segoe UI`
- Android: `Roboto`
- Fallback: `Arial, Helvetica, sans-serif`

### Font Weights
- **Regular (400)**: Body text
- **Medium (500)**: Subheadings
- **Semibold (600)**: Headlines
- **Bold (700)**: Emphasis

## Logo Specifications

### File Formats Required
1. **PNG** (transparent background)
   - Standard: 500px width
   - High DPI: 1000px width (2x)
   - Email: 250px width
   - Favicon: 32x32px, 64x64px

2. **SVG** (vector - for website)
   - Scalable to any size
   - Best for responsive web design

3. **JPG** (white background)
   - For documents and print

### Sizing Guidelines
- **Email header**: 180-250px width
- **Website header**: 150-200px width (desktop), 120px (mobile)
- **Footer**: 100-150px width
- **Social media**: 400x400px (profile), 1200x630px (cover)

## Clear Space
Maintain minimum clear space around logo equal to the height of the cloud icon on all sides.

```
    [20px clear space]
    
 yourl.cloud logo here
    
    [20px clear space]
```

## Email Implementation

### HTML Email Signature
```html
<table cellpadding="0" cellspacing="0" border="0" style="font-family: Arial, sans-serif; font-size: 14px; color: #1F2937;">
  <tr>
    <td style="padding-bottom: 10px;">
      <img src="https://yourl.cloud/assets/logo-email.png" 
           alt="yourl.cloud" 
           width="200" 
           style="display: block; border: 0;">
    </td>
  </tr>
  <tr>
    <td style="font-weight: 600; padding-bottom: 5px;">
      Your Name
    </td>
  </tr>
  <tr>
    <td style="padding-bottom: 5px;">
      Your Title
    </td>
  </tr>
  <tr>
    <td style="padding-bottom: 5px;">
      <a href="https://yourl.cloud" style="color: #3B82F6; text-decoration: none;">yourl.cloud</a>
    </td>
  </tr>
  <tr>
    <td style="padding-bottom: 5px;">
      <a href="mailto:hello@yourl.cloud" style="color: #6B7280; text-decoration: none;">hello@yourl.cloud</a>
    </td>
  </tr>
</table>
```

### Plain Text Email Signature
```
[Your Name]
[Your Title]
yourl.cloud
https://yourl.cloud
hello@yourl.cloud
```

### Email Header Template
```html
<div style="background-color: #F3F4F6; padding: 20px; text-align: center;">
  <img src="https://yourl.cloud/assets/logo-email.png" 
       alt="yourl.cloud" 
       width="220" 
       style="display: block; margin: 0 auto;">
</div>
```

## Website Implementation

### HTML Header
```html
<header>
  <nav style="padding: 1rem 2rem; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <a href="/" aria-label="yourl.cloud home">
      <img src="/assets/logo.svg" 
           alt="yourl.cloud" 
           width="180" 
           height="auto"
           style="display: block;">
    </a>
  </nav>
</header>
```

### React Component
```jsx
import Image from 'next/image'

export function Logo({ width = 180, height = 40 }) {
  return (
    <Image
      src="/assets/logo.svg"
      alt="yourl.cloud"
      width={width}
      height={height}
      priority
    />
  )
}
```

### CSS/Tailwind Styling
```css
/* Standard CSS */
.logo {
  width: 180px;
  height: auto;
  display: block;
}

/* Responsive */
@media (max-width: 768px) {
  .logo {
    width: 140px;
  }
}
```

```jsx
// Tailwind CSS
<img 
  src="/assets/logo.svg" 
  alt="yourl.cloud"
  className="w-[180px] md:w-[200px] h-auto"
/>
```

### Footer Implementation
```html
<footer style="background: #1F2937; color: white; padding: 3rem 2rem; text-align: center;">
  <img src="/assets/logo-white.svg" 
       alt="yourl.cloud" 
       width="150" 
       height="auto"
       style="display: block; margin: 0 auto 1.5rem; opacity: 0.9;">
  <p style="color: #9CA3AF; font-size: 14px;">
    © 2025 yourl.cloud. All rights reserved.
  </p>
</footer>
```

## Domain Communications

### Use Cases
- URL shortening service announcements
- Domain-related product updates
- Customer onboarding emails
- Technical documentation headers
- API documentation branding
- Status page headers
- Help center/support portal

### Messaging Tone
- **Professional**: Technical accuracy and reliability
- **Friendly**: Approachable and helpful
- **Concise**: Clear, direct communication
- **Modern**: Contemporary tech language

### Example Headlines
✅ "Shorten Your Links, Amplify Your Reach"
✅ "Cloud-Native URL Management"
✅ "Your Links, Simplified"
✅ "Fast, Reliable, Secure URL Shortening"

## Social Media Assets

### Profile Picture
- Square format: 400x400px
- Use logomark (cloud icon) or full logo centered
- Background: White or light gray (#F3F4F6)

### Cover/Banner Image
- Dimensions: 1200x630px (Facebook/LinkedIn)
- Logo placement: Left or center
- Include tagline: "Cloud-Native URL Shortening"

### Post Templates
```
[yourl.cloud logo]

Headline: Shorten Your Links in Seconds

Body text with brand colors:
- Blue (#3B82F6) for CTAs
- Dark gray (#1F2937) for body text
- Light backgrounds (#F3F4F6)

CTA Button: "Get Started" (blue background)
```

## Print Materials

### Business Cards
- Front: Logo + name/title
- Back: Contact info + website URL
- Paper: Premium matte or glossy
- Size: Standard 3.5" x 2"

### Letterhead
- Logo: Top left or center
- Size: 200px width
- Clear space: 0.5" from edges

## Accessibility

### Alt Text
```html
<!-- Standard -->
<img src="logo.png" alt="yourl.cloud">

<!-- Descriptive -->
<img src="logo.png" alt="yourl.cloud - cloud-native URL shortening service">

<!-- Decorative (use sparingly) -->
<img src="logo.png" alt="" role="presentation">
```

### Color Contrast
- Logo blue (#3B82F6) on white: **WCAG AAA compliant**
- Text dark (#1F2937) on white: **WCAG AAA compliant**
- All color combinations tested for accessibility

## File Naming Convention

```
yourl-cloud-logo-horizontal.svg          # Primary logo (SVG)
yourl-cloud-logo-horizontal.png          # Primary logo (PNG, 1x)
yourl-cloud-logo-horizontal@2x.png       # Primary logo (PNG, 2x)
yourl-cloud-logo-horizontal-white.svg    # White version for dark backgrounds
yourl-cloud-logo-square.png              # Square variant for social media
yourl-cloud-favicon-32.png               # Favicon 32x32
yourl-cloud-favicon-64.png               # Favicon 64x64
yourl-cloud-logo-email.png               # Optimized for email (220px width)
```

## Brand Voice

### Personality Traits
- **Smart**: Intelligent solutions, technical expertise
- **Simple**: Easy to use, no complexity
- **Reliable**: Trustworthy, secure, fast
- **Modern**: Contemporary, cloud-native, innovative

### Writing Style
- Use active voice
- Keep sentences short and clear
- Avoid jargon unless technical documentation
- Be helpful and supportive
- Show confidence without arrogance

### Examples
❌ "Our proprietary algorithm leverages cutting-edge technology..."
✅ "We make URL shortening fast and reliable."

❌ "Please be advised that you may utilize our platform..."
✅ "Start shortening your links today."

## Legal

### Trademark
yourl.cloud™ - All rights reserved
- Do not use the logo without permission
- Do not modify or create derivative works
- Contact legal@yourl.cloud for licensing

### Copyright Notice
```
© 2025 yourl.cloud. All rights reserved.
```

## Contact

### Brand Inquiries
- Email: brand@yourl.cloud
- For partnership logos and co-branding
- Logo usage approval requests
- Custom implementation support

### File Requests
All official logo files available at:
- Website: https://yourl.cloud/brand
- Brand Kit: https://yourl.cloud/brand-kit.zip

---

**Last Updated**: 2025-11-24  
**Version**: 1.0  
**Maintained by**: yourl.cloud Brand Team
