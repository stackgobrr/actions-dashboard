export const roadmapItems = [
  {
    id: 1,
    title: 'Focus View',
    description: 'Click repository cards to expand and see detailed workflow information, job statuses, and quick actions.',
    status: 'in-progress',
    benefits: [
      'See individual job statuses within workflows',
      'View detailed error messages and logs',
      'Quick actions to re-run or cancel workflows',
      'Pin important repositories to the top'
    ]
  },
  {
    id: 2,
    title: 'GitHub SSO',
    description: 'OAuth-based authentication with profile management and automatic repository discovery.',
    status: 'todo',
    benefits: [
      'Secure authentication with GitHub OAuth',
      'Automatic repository discovery',
      'Access organization repositories',
      'No manual token management required'
    ]
  },
  {
    id: 3,
    title: 'Real-Time Updates',
    description: 'Instant workflow status updates via webhooks instead of polling.',
    status: 'todo',
    benefits: [
      'Instant notifications when workflows complete',
      'No polling delay - see changes immediately',
      'Browser notifications for status changes',
      'Reduced API rate limit usage'
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
