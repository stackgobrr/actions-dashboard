/**
 * Mock repository data for demo mode
 * Showcases all card features and states
 */

export const MOCK_REPO_STATUSES = {
  // Animated demo card - status will cycle to show pulse animation
  'demo-pulse-animation': {
    status: 'completed',
    conclusion: 'success',
    category: 'demo',
    description: '🎬 Watch this card pulse when status changes (cycles every 5 seconds)',
    workflow: 'Animation Demo',
    branch: 'main',
    commitMessage: 'demo: showcase pulse animation on status change',
    url: 'https://github.com/demo/repo/actions/runs/999',
    updatedAt: new Date().toISOString(),
    openPRCount: 0,
    topics: ['animation', 'demo', 'ui-showcase'],
    _cycleStatus: true // Special flag to trigger status cycling
  },
  
  // Success state with topics and PRs
  'demo-success-with-prs': {
    status: 'completed',
    conclusion: 'success',
    category: 'demo',
    description: 'Successfully completed workflow with open PRs',
    workflow: 'CI Pipeline',
    branch: 'main',
    commitMessage: 'feat: add new dashboard features',
    url: 'https://github.com/demo/repo/actions/runs/123',
    updatedAt: new Date().toISOString(),
    openPRCount: 3,
    topics: ['infrastructure-as-code', 'terraform-module', 'aws']
  },
  
  // Failure state with topics
  'demo-failure': {
    status: 'completed',
    conclusion: 'failure',
    category: 'demo',
    description: 'Failed workflow example',
    workflow: 'Test Suite',
    branch: 'feature/new-feature',
    commitMessage: 'test: add comprehensive test coverage',
    url: 'https://github.com/demo/repo/actions/runs/124',
    updatedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
    openPRCount: 1,
    topics: ['testing', 'ci-cd', 'quality-assurance']
  },
  
  // In-progress state
  'demo-in-progress': {
    status: 'in_progress',
    conclusion: null,
    category: 'demo',
    description: 'Currently running workflow',
    workflow: 'Deploy to Staging',
    branch: 'develop',
    commitMessage: 'deploy: prepare version 2.0 release',
    url: 'https://github.com/demo/repo/actions/runs/125',
    updatedAt: new Date().toISOString(),
    openPRCount: 5,
    topics: ['deployment', 'staging', 'continuous-delivery']
  },
  
  // No recent runs (shows no-entry icon)
  'demo-no-runs': {
    status: 'no_runs',
    conclusion: null,
    category: 'demo',
    description: 'New repository with no workflow runs yet',
    openPRCount: 0,
    topics: ['new-project', 'getting-started', 'template']
  },
  
  // Error state
  'demo-error': {
    status: null,
    conclusion: null,
    category: 'demo',
    description: 'Repository with API error',
    error: 'Failed to fetch workflow status',
    openPRCount: 0,
    topics: ['debugging', 'troubleshooting']
  },
  
  // Warning state
  'demo-warning': {
    status: 'completed',
    conclusion: 'cancelled',
    category: 'demo',
    description: 'Workflow was cancelled',
    workflow: 'Long Running Job',
    branch: 'main',
    commitMessage: 'chore: cleanup old workflows',
    url: 'https://github.com/demo/repo/actions/runs/126',
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    openPRCount: 0,
    topics: ['maintenance', 'optimization']
  },
  
  // Many topics (tests wrapping behavior)
  'demo-many-topics': {
    status: 'completed',
    conclusion: 'success',
    category: 'demo',
    description: 'Repository with many topics to test label wrapping',
    workflow: 'Build & Deploy',
    branch: 'main',
    commitMessage: 'build: optimize build process for production',
    url: 'https://github.com/demo/repo/actions/runs/127',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    openPRCount: 2,
    topics: ['javascript', 'react', 'typescript', 'vite', 'testing', 'ci-cd', 'docker', 'kubernetes']
  },
  
  // Long topic names (tests truncation)
  'demo-long-topics': {
    status: 'completed',
    conclusion: 'success',
    category: 'demo',
    description: 'Repository with very long topic names to test truncation',
    workflow: 'Release Pipeline',
    branch: 'main',
    commitMessage: 'release: version 1.0.0',
    url: 'https://github.com/demo/repo/actions/runs/128',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    openPRCount: 0,
    topics: ['very-long-topic-name-that-should-truncate-properly', 'another-extremely-long-topic-name-for-testing']
  },
  
  // High PR count
  'demo-high-pr-count': {
    status: 'completed',
    conclusion: 'success',
    category: 'demo',
    description: 'Active repository with many open pull requests',
    workflow: 'PR Checks',
    branch: 'main',
    commitMessage: 'merge: integrate multiple feature branches',
    url: 'https://github.com/demo/repo/actions/runs/129',
    updatedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
    openPRCount: 42,
    topics: ['active-development', 'open-source', 'community']
  },
  
  // Minimal - no topics, no description
  'demo-minimal': {
    status: 'completed',
    conclusion: 'success',
    category: 'demo',
    workflow: 'Quick Test',
    branch: 'main',
    commitMessage: 'fix: minor bug fix',
    url: 'https://github.com/demo/repo/actions/runs/130',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
    openPRCount: 0,
    topics: []
  },
  
  // Single topic
  'demo-single-topic': {
    status: 'completed',
    conclusion: 'success',
    category: 'demo',
    description: 'Repository with single topic label',
    workflow: 'Linting',
    branch: 'main',
    commitMessage: 'style: apply code formatting',
    url: 'https://github.com/demo/repo/actions/runs/131',
    updatedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 minutes ago
    openPRCount: 0,
    topics: ['utilities']
  },
  
  // Different categories for sorting
  'demo-frontend': {
    status: 'completed',
    conclusion: 'success',
    category: 'frontend',
    description: 'Frontend application repository',
    workflow: 'Build UI',
    branch: 'main',
    commitMessage: 'ui: update component library',
    url: 'https://github.com/demo/repo/actions/runs/132',
    updatedAt: new Date().toISOString(),
    openPRCount: 1,
    topics: ['react', 'ui', 'frontend']
  },
  
  'demo-backend': {
    status: 'completed',
    conclusion: 'success',
    category: 'backend',
    description: 'Backend API service',
    workflow: 'API Tests',
    branch: 'main',
    commitMessage: 'api: add new endpoints',
    url: 'https://github.com/demo/repo/actions/runs/133',
    updatedAt: new Date().toISOString(),
    openPRCount: 0,
    topics: ['api', 'backend', 'nodejs']
  }
}
