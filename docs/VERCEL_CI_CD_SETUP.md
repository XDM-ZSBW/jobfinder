# Vercel CI/CD Setup for jobmatch.zip

This guide explains how to set up automated deployment to Vercel (jobmatch.zip) that only deploys after GitHub workflow checks pass.

## Overview

The workflow `.github/workflows/deploy-vercel-ci-cd.yml` ensures:

1. ✅ **Code Quality Checks** - Linting and type checking must pass
2. ✅ **Build Verification** - Frontend and backend must build successfully
3. ✅ **Automatic Deployment** - Only deploys to Vercel after all checks pass

## Workflow Structure

```
Push to main
    ↓
Code Quality Checks ✅
  - Lint frontend & backend
  - Type check frontend & backend
  - Build frontend & backend
  - Verify build artifacts
    ↓
Deploy Frontend to Vercel ✅
    ↓
Deploy Backend to Vercel ✅
    ↓
Deployment Complete! 🎉
```

## Setup Instructions

### 1. Configure GitHub Secrets

Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions**

Add these secrets:

- **`VERCEL_TOKEN`**: Your Vercel API token
  - Get it from: [Vercel Dashboard](https://vercel.com/account/tokens) → Create Token
  - Name: `github-actions`
  - Scope: Full Account

- **`VERCEL_ORG_ID`**: Your Vercel Organization ID
  - Find it in: Vercel Dashboard → Settings → General
  - Or run: `vercel whoami` and check your account settings

- **`VERCEL_FRONTEND_PROJECT_ID`**: Your Frontend Vercel Project ID
  - Find it in: Vercel Dashboard → Frontend Project → Settings → General
  - Or run: `cd frontend && vercel link` and check `.vercel/project.json`

- **`VERCEL_BACKEND_PROJECT_ID`**: Your Backend Vercel Project ID
  - Find it in: Vercel Dashboard → Backend Project → Settings → General
  - Or run: `cd backend && vercel link` and check `.vercel/project.json`
  
**Note**: Frontend and backend should be separate Vercel projects for better isolation and independent scaling.

### 2. Enable Branch Protection

**Critical**: This ensures deployments only happen after checks pass.

1. Go to **Repository Settings** → **Branches**
2. Click **Add branch protection rule**
3. Branch name pattern: `main`
4. Enable these settings:

   **Protect matching branches:**
   - ✅ Require a pull request before merging
   - ✅ Require approvals: 1 (optional but recommended)
   
   **Require status checks to pass before merging:**
   - ✅ Require "Code Quality Checks" to pass
   - ✅ Require "Build" to pass (if separate job)
   - ✅ Require branches to be up to date before merging
   
   **Restrict who can push to matching branches:**
   - ✅ Do not allow bypassing the above settings

5. Click **Create**

### 3. Verify Workflow File

The workflow file `.github/workflows/deploy-vercel-ci-cd.yml` is already configured with:

- **Checks Job**: Runs linting, type checking, and builds
- **Deploy Frontend**: Deploys to Vercel production (only after checks pass)
- **Deploy Backend**: Deploys to Vercel production (only after checks pass)

### 4. Test the Workflow

#### Test on Pull Request

1. Create a pull request to `main` branch
2. The workflow will run checks only (no deployment)
3. Verify all checks pass ✅
4. Merge the PR

#### Test Deployment

1. Merge pull request to `main` branch
2. The workflow will:
   - Run all checks ✅
   - Build frontend and backend ✅
   - Deploy to Vercel production ✅
3. Monitor the **Actions** tab for progress

### 5. Manual Deployment

You can also trigger deployments manually:

1. Go to **Actions** tab
2. Select **Deploy jobmatch.zip to Vercel (CI/CD)**
3. Click **Run workflow**
4. Select branch (`main`) and click **Run workflow**

## Workflow Jobs

### 1. Code Quality Checks (`checks`)

**Must pass** for deployment to proceed:

- ✅ Lint frontend (ESLint)
- ✅ Lint backend (ESLint)
- ✅ Type check frontend (TypeScript)
- ✅ Type check backend (TypeScript)
- ✅ Build frontend (Vite)
- ✅ Build backend (TypeScript)
- ✅ Verify build artifacts exist

### 2. Deploy Frontend (`deploy-frontend`)

- Only runs on `main` branch pushes
- Only runs after `checks` job passes
- Deploys to Vercel production
- Uses `frontend/vercel.json` configuration

### 3. Deploy Backend (`deploy-backend`)

- Only runs on `main` branch pushes
- Only runs after `checks` job passes
- Deploys to Vercel production
- Uses `backend/vercel.json` configuration

## Troubleshooting

### Checks Not Passing

**Linting Errors:**
```bash
# Fix locally
cd frontend && npm run lint -- --fix
cd backend && npm run lint -- --fix
```

**Type Errors:**
```bash
# Check types locally
cd frontend && npm run typecheck
cd backend && npm run typecheck
```

**Build Errors:**
```bash
# Build locally to see errors
cd frontend && npm run build
cd backend && npm run build
```

### Deployment Failing

**Missing Secrets:**
- Verify all three Vercel secrets are set in GitHub
- Check secret names match exactly (case-sensitive)

**Vercel Authentication:**
- Verify `VERCEL_TOKEN` is valid and not expired
- Check token has correct permissions

**Project Configuration:**
- Verify `VERCEL_ORG_ID`, `VERCEL_FRONTEND_PROJECT_ID`, and `VERCEL_BACKEND_PROJECT_ID` are correct
- Check both projects exist in Vercel dashboard
- Ensure frontend and backend are separate projects (recommended)

### Workflow Not Running

**Check Triggers:**
- Workflow only runs on pushes to `main` branch
- Or on pull requests to `main`
- Or manual dispatch

**Check Workflow File:**
- Verify `.github/workflows/deploy-vercel-ci-cd.yml` exists
- Check YAML syntax is valid
- Ensure file is committed to repository

## Branch Protection Best Practices

1. ✅ **Always require PR reviews** before merging
2. ✅ **Require status checks** to pass
3. ✅ **Require branches to be up to date** before merging
4. ✅ **Don't allow bypassing** protection rules
5. ✅ **Set required reviewers** (optional but recommended)

## Monitoring

- **GitHub Actions**: View workflow runs in Actions tab
- **Vercel Dashboard**: Check deployments and logs
- **Health Endpoint**: `https://jobmatch.zip/health`

## Next Steps

1. ✅ Configure GitHub Secrets (see above)
2. ✅ Enable branch protection (see above)
3. ✅ Test with a pull request
4. ✅ Merge to trigger first deployment
5. ✅ Monitor deployment in Actions tab

## Migration from Old Workflows

The old workflows (`deploy-frontend.yml` and `deploy-backend.yml`) are still active but deprecated. They will be removed in the future.

**To migrate:**
1. Use the new workflow: `deploy-vercel-ci-cd.yml`
2. Disable old workflows (or they'll be removed automatically)
3. Update branch protection to require "Code Quality Checks" instead of old job names

For questions or issues, check the workflow logs in the Actions tab.

