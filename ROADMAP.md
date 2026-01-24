# Roadmap

## Planned Features

### 1. Focus View
Click on repository cards to expand and see detailed workflow information.

**Features:**
- Expandable card view with full workflow details
- Pin important repositories to the top
- Show individual job statuses within workflows
- Quick actions (re-run workflows, view logs)
- Keyboard shortcuts for navigation

**Status:** Planned

---

### 2. GitHub SSO & User Profiles
User authentication and profiles to unlock premium features.

**Features:**
- Sign in with GitHub
- User profile and preferences
- Save custom dashboard configurations
- Required for paid tier features

**Status:** Planned

---

### 3. Real-Time Updates (Paid Tier)
Instant workflow updates via webhooks instead of polling.

**Features:**
- Live updates when workflows start/complete/fail
- No polling delay - instant status changes
- Browser notifications for status changes
- Automatic fallback to polling if disconnected
- Premium feature for paid users

**Status:** Infrastructure ready, needs integration

- **Success Rate Trends**: Track workflow reliability over time
- **Duration Analysis**: Identify slow or degrading workflows
- **Failure Patterns**: Spot recurring failure causes
- **Cost Tracking**: Estimate GitHub Actions minutes consumed
- **Time-of-Day Analysis**: When do most failures occur
- **Branch Comparison**: Compare workflow performance across branches
- **Export Reports**: Generate PDF/CSV reports for stakeholders

**Note**: Requires backend service for data persistence

### 8. GitHub SSO & User Profiles
**Priority: Medium**

OAuth-based authentication with user profiles:

- **OAuth Flow**: Secure GitHub OAuth authentication (no tokens to manage)
- **User Profiles**: Display GitHub avatar, name, and account info
- **Auto-Discovery**: Automatically discover accessible repositories
- **Team/Org Repos**: Access organization repositories you're a member of
- **Permission Scopes**: Request only necessary GitHub permissions
- **Session Management**: Secure session handling with refresh tokens
- **Multi-Account**: Switch between multiple GitHub accounts
- **Remember Me**: Persistent login across browser sessions

**Note**: Requires backend service to handle OAuth flow and store refresh tokens securely

### 9. Team Collaboration Features
**Priority: Low**

Multi-user support for team environments:

- **Shared Configurations**: Team-wide repository and filter settings
- **User Roles**: Admin, viewer, and contributor permissions
- **Activity Feed**: See who made changes to dashboard config
- **Annotations**: Add notes to specific workflow runs
- **@Mentions**: Tag team members in workflow comments
- **Dashboard Presets**: Save and share custom dashboard views

**Note**: Requires backend service with authentication (pairs with GitHub SSO)

### 10. Advanced Filtering & Search
**Priority: Medium**

Enhanced ways to find and organize workflows:

- **Saved Filters**: Create and save complex filter combinations
- **Quick Filters**: One-click presets (failed today, in-progress, etc.)
- **Regex Search**: Advanced pattern matching for workflow names
- **Multi-Select**: Select multiple repos/workflows for batch actions
- **Smart Collections**: Auto-grouped workflows based on patterns
- **Search History**: Recently searched terms and filters

### 11. Browser Extension
**Priority: Low**

Chrome/Firefox extension for quick access:

- **Toolbar Icon**: Show at-a-glance status summary
- **Badge Notifications**: Display count of failed workflows
- **Quick Open**: Open full dashboard with keyboard shortcut
- **Mini Dashboard**: Compact view in extension popup
- **Native Notifications**: System-level notifications
- **Right-Click Actions**: Quick actions from context menu

### 12. Workflow Actions
**Priority: Medium**

Perform actions directly from the dashboard:

- **Re-run Failed Jobs**: Restart failed workflow runs
- **Cancel Running Workflows**: Stop long-running jobs
- **Manual Triggers**: Trigger workflow_dispatch workflows
- **Approve Deployments**: Approve pending deployment jobs
- **View Artifacts**: Download workflow artifacts
- **Compare Runs**: Side-by-side diff of workflow runs

**Note**: Requires write permissions on GitHub token/app

### 13. Docker & Kubernetes Deployment
**Priority: Medium**

Containerized deployment options for self-hosting:

- **Dockerfile**: Multi-stage build for optimized container images
- **Docker Compose**: Local development environment with hot reload
- **Helm Chart**: Production-ready Kubernetes deployment
- **Health Checks**: Liveness and readiness probes
- **Environment Configuration**: Configurable via environment variables
- **Multi-Architecture**: Support for amd64 and arm64 platforms
- **CI/CD Pipeline**: Automated Docker image builds and publishing
- **Registry Publishing**: Push images to Docker Hub/GHCR
- **Ingress Configuration**: NGINX/Traefik ingress support
- **Resource Limits**: Sensible CPU/memory defaults
- **Horizontal Scaling**: Support multiple replicas behind load balancer

**Use Cases**:
- Self-hosted enterprise deployments
- On-premise installations with air-gapped environments
- Kubernetes cluster integration alongside other tools
- Custom domain and SSL certificate management

## Future Considerations

- **Mobile App**: Native iOS/Android apps with push notifications
- **Slack/Discord Integration**: Post workflow status to team chat channels
- **Multi-User**: Shared dashboard configurations for teams
- **Historical Data**: Long-term storage and analysis of workflow history
- **Custom Metrics**: Define and track custom KPIs across workflows
- **AI Insights**: Predictive analysis for workflow failures and optimization suggestions

## Contributing

Have ideas for features not listed here? Please open an issue on GitHub to discuss!

---

**Last Updated**: December 19, 2025
