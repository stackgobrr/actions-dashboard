export const roadmapItems = [
  {
    id: 1,
    title: 'Focus View',
    description: 'Click repository cards to expand and see detailed workflow information, job statuses, and quick actions.',
    status: 'in-progress'
  },
  {
    id: 2,
    title: 'GitHub SSO',
    description: 'OAuth-based authentication with profile management and automatic repository discovery.',
    status: 'todo'
  },
  {
    id: 3,
    title: 'Real-Time Updates',
    description: 'Instant workflow status updates via webhooks instead of polling.',
    status: 'todo'
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
