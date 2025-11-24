# Simple UAT Testing Guide

## No Technical Knowledge Required! 🎯

This guide is designed for non-technical users to test changes easily.

## Quick Start (3 Steps)

### Step 1: Test Locally
1. **Start the application** (if not already running):
   ```bash
   npm run dev
   ```
   Or if using Docker:
   ```bash
   docker-compose up
   ```

2. **Open UAT Portal**: http://localhost:3000/uat

3. **Enter your name** at the top

4. **Select "Localhost (Testing)"** environment

5. **For each test case**:
   - Click "🧪 Test Locally" button
   - Test the feature
   - Click ✅ **Passed** or ❌ **Failed**
   - Add notes if something doesn't work

### Step 2: Report Results
1. **Add overall summary** at the bottom
2. **Click "📋 Copy Report to Clipboard"**
3. **Paste the report in this chat**

### Step 3: Verify on Production
1. **Switch environment** to "Production (Verification)"
2. **Click "✅ Verify Production"** for each test
3. **Verify** that production matches what you tested locally
4. **Update report** and paste in chat again

## That's It!

You don't need to:
- ❌ Know command line
- ❌ Understand technical terms
- ❌ Access servers
- ❌ Configure anything

You just need to:
- ✅ Click buttons
- ✅ Test features
- ✅ Copy and paste

## What Gets Tested

The UAT portal automatically tests:
- Version display (REV001 badge)
- Universal Canvas functionality
- Canvas form fields on all forms
- "Other" freetext options on all forms
- Form submissions
- Production matches localhost

## Need Help?

If something doesn't work:
1. Add notes in the test case
2. Include notes in your summary
3. Paste the report in chat
4. We'll fix it!

## Links

- **UAT Portal**: http://localhost:3000/uat
- **Localhost Homepage**: http://localhost:3000
- **Production Homepage**: https://jobmatch.zip

