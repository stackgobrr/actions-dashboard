# Shared GitHub App Setup Guide

## Overview
This guide walks you through completing the shared GitHub App setup for "Actions Dashboard by StackGoBrr".

## Prerequisites
- GitHub App already created: "Actions Dashboard by StackGoBrr" (App ID: 2594325)
- App slug needed (find at `https://github.com/settings/apps/YOUR-APP-SLUG`)

## Step 1: Configure GitHub Repository Variables

Add the following repository variable in GitHub:
`Settings → Secrets and variables → Actions → Variables → New repository variable`

**Variable Name**: `GITHUB_APP_SLUG`
**Value**: Your app slug (e.g., `actions-dashboard-by-stackgobrr`)

## Step 2: Update GitHub App Settings

In your GitHub App settings (`https://github.com/settings/apps/actions-dashboard-by-stackgobrr`):

### Callback URL
Add this to "Callback URL" field:
```
https://actions.dashboard.stackgobrr.com/auth/github/callback
```

### Webhook Configuration
- **Webhook URL**: (Already configured from deployment output)
- **Webhook secret**: (Already configured as `WEBHOOK_SECRET`)
- **Webhook events**:
  - ✅ Pull request
  - ✅ Workflow job
  - ✅ Workflow run

### Permissions
- Actions: **Read-only**
- Contents: **Read-only**
- Metadata: **Read-only** (automatic)
- Pull requests: **Read-only**

## Step 3: Install React Router [DONE]

The OAuth callback flow requires React Router:
- [x] Installed `react-router-dom`
- [x] Setup routes in App.jsx with BrowserRouter
- [x] Added route for `/auth/github/callback` → `SharedAppAuth` component

## Step 4: Update useAuth Hook [DONE]

Added support for `shared-app` auth method:
- [x] Checks for `shared_app_installation_id` in localStorage
- [x] Sets auth method to 'shared-app' when installation found
- [x] SSE automatically connects using installation ID
- [x] Logout clears shared app credentials

## Step 5: Configure GitHub App Callback URL [DONE]

Add the callback URL to your GitHub App settings:
1. Navigate to: https://github.com/organizations/stackgobrr/settings/apps/actions-dashboard-by-stackgobrr
2. Add callback URL: `https://actions.dashboard.stackgobrr.com/auth/github/callback`
3. Save changes

Status: [x] Callback URL already configured

## Step 6: Test the Flow

1. [x] Deploy with `APP_SLUG` variable set (actions-dashboard-by-stackgobrr)
2. Visit landing page - should see "Install GitHub App" button
3. Click button → redirected to GitHub
4. Install app to your account/repos
5. GitHub redirects back to `/auth/github/callback?installation_id=XXX`
6. App stores installation_id and redirects to dashboard
7. Dashboard connects via SSE using installation_id
8. Trigger a workflow → webhook → SSE → instant dashboard update!

## Current Status

[x] Backend fully operational (webhook → Lambda → SSE)
[x] Frontend SSE integration complete
[x] SharedAppAuth component created
[x] Landing page conditional button added
[x] React Router setup complete
[x] useAuth shared-app support complete
[x] GitHub App slug configured (APP_SLUG variable set)
[x] GitHub App callback URL configured
[x] AuthSetup prioritizes shared app installation
[ ] Deployment complete (in progress)
[ ] End-to-end testing (ready to test)

## Files Modified
- `.github/workflows/deploy.yml` - Added `VITE_APP_SLUG` env var (renamed from VITE_GITHUB_APP_SLUG)
- `src/config/githubApp.js` - Shared app configuration
- `src/components/Auth/SharedAppAuth.jsx` - OAuth callback handler
- `src/components/LandingPage/LandingPage.jsx` - Conditional install button
- `src/main.jsx` - Added BrowserRouter wrapper
- `src/App.jsx` - Added Routes and OAuth callback route
- `src/hooks/useAuth.js` - Added shared-app auth method support
- `src/hooks/useGitHubStatus.js` - Enabled SSE for shared-app auth
- `package.json` - Added react-router-dom dependency

## Next Steps
1. Configure GitHub App callback URL in GitHub settings
2. Wait for deployment to complete (will inject APP_SLUG at build time)
3. Test the complete flow:
   - Visit landing page
   - Click "Install GitHub App" button
   - Complete GitHub installation
   - Verify redirect to dashboard
   - Trigger a workflow to test SSE updates
