export const roadmapItems = [
  {
    id: 1,
    title: 'Focus View',
    description: 'Click repository cards to expand and see detailed workflow information, job statuses, and quick actions.',
    status: 'in-progress',
    quarter: 'Q1 2026'
  },
  {
    id: 2,
    title: 'GitHub SSO',
    description: 'OAuth-based authentication with profile management and automatic repository discovery.',
    status: 'planned',
    quarter: 'Q2 2026'
  },
  {
    id: 3,
    title: 'Real-Time Updates',
    description: 'Instant workflow status updates via webhooks instead of polling.',
    status: 'planned',
    quarter: 'Q2 2026'
  }
]

export const statusConfig = {
  'in-progress': {
    label: 'In Progress',
    color: '#1f6feb'
  },
  'planned': {
    label: 'Planned',
    color: '#8957e5'
  },
  'backlog': {
    label: 'Backlog',
    color: '#656d76'
  },
  'done': {
    label: 'Done',
    color: '#1a7f37'
  }
}
