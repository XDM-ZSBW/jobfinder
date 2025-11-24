# User Acceptance Testing (UAT) Guide

## Quick Start - Simple UAT Portal

**🎯 Easiest Way to Test:** Use the UAT Testing Portal

1. **Open UAT Portal:** http://localhost:3000/uat
2. **Test Locally:** Click "Test Locally" buttons for each test case
3. **Mark Results:** Click ✅ Passed or ❌ Failed for each test
4. **Verify Production:** Switch to "Production" environment and verify on https://jobmatch.zip
5. **Copy Report:** Click "Copy Report to Clipboard" and paste in chat

That's it! No technical knowledge required.

---

## Deployment Information

**Localhost:** `http://localhost:3000`
**Production:** `https://jobmatch.zip`
**API Endpoint:** `https://jobmatch.zip/api`
**API Documentation:** `https://jobmatch.zip/api/docs`

## Pre-UAT Checklist

### For Localhost Testing:
- [ ] Application running locally (`npm run dev` or `docker-compose up`)
- [ ] Frontend accessible at http://localhost:3000
- [ ] Backend accessible at http://localhost:8000

### For Production Testing:
- [ ] Application deployed to https://jobmatch.zip
- [ ] SSL certificate configured
- [ ] Health checks passing

## UAT Test Cases (Automated in Portal)

All test cases are available in the UAT Portal at http://localhost:3000/uat

### Test Cases Included:

1. **Version Display (REV001)** - Verify version badge appears
2. **Universal Canvas** - Test canvas functionality
3. **Assessment Form with Canvas Field** - Verify canvas form field works
4. **Assessment "Other" Option** - Verify freetext option works
5. **XDMIQ Canvas Field** - Verify canvas field for reasoning
6. **XDMIQ "Other" Option** - Verify freetext option works
7. **Marketplace Canvas Field** - Verify canvas field for description
8. **Marketplace "Other" Option** - Verify freetext option works

### Using the UAT Portal:

1. Open http://localhost:3000/uat
2. Enter your name
3. Select "Localhost (Testing)" environment
4. For each test:
   - Click "🧪 Test Locally" to open the page
   - Test the functionality
   - Click ✅ Passed or ❌ Failed
   - Add notes if needed
5. Switch to "Production (Verification)" environment
6. Click "✅ Verify Production" for each test to verify it matches localhost
7. Add overall summary
8. Click "📋 Copy Report to Clipboard"
9. Paste the report in chat

## Manual Test Script (Optional)

For technical users who prefer command line:
```bash
# Localhost
curl http://localhost:3000/health
curl http://localhost:8000/api/health

# Production
curl https://jobmatch.zip/health
curl https://jobmatch.zip/api/health
```

## Known Issues

- Ollama model pull may take time on first startup
- Swap file created for memory optimization
- Initial deployment may take 5-10 minutes

## Rollback Procedure

If issues are found:
```bash
# SSH into VM
gcloud compute ssh jobmatch-vm --zone=us-central1-a

# Stop services
cd /opt/jobmatch
docker-compose down

# Restore previous version or fix issues
```

## Support

For issues or questions:
1. Check logs: `docker-compose logs` on VM
2. Check health: `curl http://<VM_IP>/health`
3. Review deployment logs in GCP Console

