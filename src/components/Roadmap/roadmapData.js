export const roadmapItems = [
  {
    id: 1,
    title: 'Auth — GitHub OAuth',
    description: 'Implement Sign in with GitHub and secure session handling (httpOnly cookie).',
    status: 'done',
    benefits: [
      'Low-friction sign in',
      'Stable identity across devices',
      'Foundation for persisted settings and subscriptions'
    ]
  },
  {
    id: 2,
    title: 'Persistence — Profiles & Settings',
    description: 'Small managed DB to store users, settings, and installation mappings so preferences follow users.',
    status: 'todo',
    benefits: [
      'Settings restored on any device',
      'Map installations to users for routing',
      'Enable saved dashboard configurations'
    ]
  },
  {
    id: 3,
    title: 'Webhooks — Receiver & Routing',
    description: 'Server-side webhook endpoint (serverless) to verify signatures, dedupe retries, and route events by installation/repo.',
    status: 'todo',
    benefits: [
      'Near-real-time events',
      'Reduced polling and API usage',
      'Reliable retry/dedup behavior'
    ]
  },
  {
    id: 4,
    title: 'Token-proxy — GitHub App (server-side)',
    description: 'Keep GitHub App private key server-side and mint installation tokens on demand for app-level actions.',
    status: 'todo',
    benefits: [
      'No private keys in browser',
      'Support install-level webhooks and app actions',
      'Safer token lifecycle management'
    ]
  },
  {
    id: 5,
    title: 'Real-Time Delivery',
    description: 'Push events to clients via SSE or WebSocket and provide fallback to polling.',
    status: 'todo',
    benefits: [
      'Instant UI updates',
      'Graceful fallback when disconnected',
      'Better user experience than polling'
    ]
  },
  {
    id: 6,
    title: 'Focus View',
    description: 'Click repository cards to expand and see detailed workflow information, job statuses, and quick actions.',
    status: 'todo',
    benefits: [
      'See individual job statuses within workflows',
      'View detailed error messages and logs',
      'Quick actions to re-run or cancel workflows',
      'Pin important repositories to the top'
    ]
  }
]

export const statusConfig = {
  'in-progress': {
    label: 'In Progress',
    variant: 'accent'
  },
  'todo': {
    label: 'To Do',
    variant: 'default'
  },
  'done': {
    label: 'Done',
    variant: 'success'
  }
}
