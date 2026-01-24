import {
  BellIcon,
  EyeIcon,
  TelescopeIcon,
  RocketIcon,
  GraphIcon,
  ShieldLockIcon,
  PeopleIcon,
  SearchIcon,
  DownloadIcon,
  GearIcon,
  TerminalIcon,
  CodeIcon
} from '@primer/octicons-react'

export const roadmapFeatures = [
  {
    id: 1,
    title: "Webhook Support",
    priority: "medium",
    status: "planned",
    category: "Live Updates",
    description: "Live updates through GitHub webhooks instead of polling",
    icon: BellIcon,
    features: [
      "Webhook Receiver: Lightweight backend service",
      "Push Notifications: Browser notifications on status changes",
      "Instant Updates: No polling delay",
      "Event Filtering: Configure which events trigger updates",
      "Webhook Management: Setup guide and testing tools",
      "Fallback Polling: Automatic fallback if webhooks unavailable",
      "Multi-Repository: Support webhooks for multiple repos"
    ]
  },
  {
    id: 2,
    title: "Focus View",
    priority: "medium",
    status: "planned",
    category: "User Experience",
    description: "Distraction-free monitoring mode for critical workflows",
    icon: EyeIcon,
    features: [
      "Fullscreen Mode: Clean, minimal interface",
      "Custom Layouts: Arrange cards in custom configurations",
      "Pin Workflows: Keep important workflows visible",
      "Hide Completed: Focus on active/failed runs",
      "Color Coding: Enhanced visual indicators",
      "Keyboard Navigation: Navigate without mouse",
      "TV/Display Mode: Large text for wall-mounted displays",
      "Auto-Refresh Control: Configurable refresh rates"
    ]
  },
  {
    id: 3,
    title: "Workflow Highlights",
    priority: "medium",
    status: "planned",
    category: "Analytics",
    description: "Enhanced visibility and insights for workflow runs",
    icon: TelescopeIcon,
    features: [
      "Execution Timeline: Visual timeline with job duration",
      "Performance Metrics: Track average run time and trends",
      "Cost Estimates: Approximate GitHub Actions minutes",
      "Failure Analysis: Quick view of error messages",
      "Job Details: Expandable view of individual jobs",
      "Annotations: Display checks annotations inline",
      "Quick Actions: Restart failed workflows from dashboard",
      "Compare Runs: Side-by-side comparison",
      "Custom Tags: Add labels for better organization"
    ]
  },
  {
    id: 4,
    title: "Deployment Tracking",
    priority: "high",
    status: "planned",
    category: "Monitoring",
    description: "Monitor GitHub deployment status across environments",
    icon: RocketIcon,
    features: [
      "Environment Overview: View current status per environment",
      "Deployment History: Timeline with commit SHAs",
      "Active Deployments: See which version is deployed",
      "Environment Health: Track success/failure rates",
      "Deployment Cards: Dedicated cards for deployments",
      "Approval Status: Display pending approvals",
      "Rollback Detection: Identify rollbacks",
      "Deployment Links: Direct links to applications",
      "Multi-Environment: Support multiple environments",
      "Deployment Comparison: Compare staging vs prod",
      "Time in Environment: Track deployment duration"
    ],
    useCases: [
      "Know exactly what version is in production",
      "Track deployment frequency and stability",
      "Monitor environment-specific health",
      "Identify which environments need updates"
    ]
  },
  {
    id: 5,
    title: "Roadmap Page",
    priority: "low",
    status: "in-progress",
    category: "Community",
    description: "Interactive roadmap visible to users within the application",
    icon: GraphIcon,
    features: [
      "Feature Voting: Allow users to upvote features",
      "Status Indicators: Show planned, in-progress, completed",
      "Progress Tracking: Visual progress bars",
      "Release Notes: Link completed features to releases",
      "GitHub Integration: Pull issues/milestones",
      "Community Input: Easy way to suggest features"
    ]
  },
  {
    id: 6,
    title: "TypeScript Migration",
    priority: "medium",
    status: "planned",
    category: "Code Quality",
    description: "Migrate the codebase from JavaScript to TypeScript",
    icon: CodeIcon,
    features: [
      "Type Safety: Catch errors at compile time",
      "Better IDE Support: Enhanced autocomplete",
      "Refactoring Confidence: Safer refactoring",
      "API Contracts: Type-safe GitHub API responses",
      "Component Props: Strictly typed React props",
      "Gradual Migration: Migrate incrementally",
      "Documentation: Types serve as inline docs"
    ]
  },
  {
    id: 7,
    title: "Workflow Analytics",
    priority: "low",
    status: "planned",
    category: "Analytics",
    description: "Historical data and insights about workflow performance",
    icon: GraphIcon,
    features: [
      "Success Rate Trends: Track reliability over time",
      "Duration Analysis: Identify slow workflows",
      "Failure Patterns: Spot recurring causes",
      "Cost Tracking: Estimate Actions minutes consumed",
      "Time-of-Day Analysis: When failures occur",
      "Branch Comparison: Compare performance across branches",
      "Export Reports: Generate PDF/CSV reports"
    ],
    note: "Requires backend service for data persistence"
  },
  {
    id: 8,
    title: "GitHub SSO & User Profiles",
    priority: "medium",
    status: "planned",
    category: "Authentication",
    description: "OAuth-based authentication with user profiles",
    icon: ShieldLockIcon,
    features: [
      "OAuth Flow: Secure GitHub OAuth authentication",
      "User Profiles: Display avatar, name, and account info",
      "Auto-Discovery: Automatically discover repositories",
      "Team/Org Repos: Access organization repositories",
      "Permission Scopes: Request only necessary permissions",
      "Session Management: Secure session handling",
      "Multi-Account: Switch between multiple accounts",
      "Remember Me: Persistent login across sessions"
    ],
    note: "Requires backend service for OAuth flow"
  },
  {
    id: 9,
    title: "Team Collaboration Features",
    priority: "low",
    status: "planned",
    category: "Collaboration",
    description: "Multi-user support for team environments",
    icon: PeopleIcon,
    features: [
      "Shared Configurations: Team-wide settings",
      "User Roles: Admin, viewer, contributor permissions",
      "Activity Feed: See who made changes",
      "Annotations: Add notes to workflow runs",
      "@Mentions: Tag team members in comments",
      "Dashboard Presets: Save and share custom views"
    ],
    note: "Requires backend service with authentication"
  },
  {
    id: 10,
    title: "Advanced Filtering & Search",
    priority: "medium",
    status: "planned",
    category: "User Experience",
    description: "Enhanced ways to find and organize workflows",
    icon: SearchIcon,
    features: [
      "Saved Filters: Create and save filter combinations",
      "Quick Filters: One-click presets (failed today, etc.)",
      "Regex Search: Advanced pattern matching",
      "Multi-Select: Batch actions on multiple repos",
      "Smart Collections: Auto-grouped workflows",
      "Search History: Recently searched terms"
    ]
  },
  {
    id: 11,
    title: "Browser Extension",
    priority: "low",
    status: "planned",
    category: "User Experience",
    description: "Chrome/Firefox extension for quick access",
    icon: DownloadIcon,
    features: [
      "Toolbar Icon: At-a-glance status summary",
      "Badge Notifications: Count of failed workflows",
      "Quick Open: Open dashboard with keyboard shortcut",
      "Mini Dashboard: Compact view in popup",
      "Native Notifications: System-level notifications",
      "Right-Click Actions: Quick actions from context menu"
    ]
  },
  {
    id: 12,
    title: "Workflow Actions",
    priority: "medium",
    status: "planned",
    category: "Actions",
    description: "Perform actions directly from the dashboard",
    icon: GearIcon,
    features: [
      "Re-run Failed Jobs: Restart failed runs",
      "Cancel Running Workflows: Stop long-running jobs",
      "Manual Triggers: Trigger workflow_dispatch",
      "Approve Deployments: Approve pending jobs",
      "View Artifacts: Download workflow artifacts",
      "Compare Runs: Side-by-side diff of runs"
    ],
    note: "Requires write permissions on GitHub token/app"
  },
  {
    id: 13,
    title: "Docker & Kubernetes Deployment",
    priority: "medium",
    status: "planned",
    category: "Deployment",
    description: "Containerized deployment options for self-hosting",
    icon: TerminalIcon,
    features: [
      "Dockerfile: Multi-stage build for optimized images",
      "Docker Compose: Local development environment",
      "Helm Chart: Production-ready Kubernetes deployment",
      "Health Checks: Liveness and readiness probes",
      "Environment Configuration: Configurable via env vars",
      "Multi-Architecture: Support amd64 and arm64",
      "CI/CD Pipeline: Automated image builds",
      "Registry Publishing: Push to Docker Hub/GHCR",
      "Ingress Configuration: NGINX/Traefik support",
      "Resource Limits: Sensible CPU/memory defaults",
      "Horizontal Scaling: Multiple replicas support"
    ],
    useCases: [
      "Self-hosted enterprise deployments",
      "On-premise installations with air-gapped environments",
      "Kubernetes cluster integration",
      "Custom domain and SSL certificate management"
    ]
  }
]

export const futureConsiderations = [
  "Mobile App: Native iOS/Android apps with push notifications",
  "Slack/Discord Integration: Post workflow status to team chat",
  "Multi-User: Shared dashboard configurations for teams",
  "Historical Data: Long-term storage and analysis",
  "Custom Metrics: Define and track custom KPIs",
  "AI Insights: Predictive analysis and optimization suggestions"
]

export const statusConfig = {
  'planned': {
    label: 'Planned',
    color: 'accent',
    icon: '📋'
  },
  'in-progress': {
    label: 'In Progress',
    color: 'attention',
    icon: '🚧'
  },
  'completed': {
    label: 'Completed',
    color: 'success',
    icon: '✅'
  }
}

export const priorityConfig = {
  'high': {
    label: 'High Priority',
    color: 'danger',
    icon: '🔴'
  },
  'medium': {
    label: 'Medium Priority',
    color: 'attention',
    icon: '🟡'
  },
  'low': {
    label: 'Low Priority',
    color: 'success',
    icon: '🟢'
  }
}
