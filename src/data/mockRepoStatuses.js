/**
 * Mock repository data for demo mode
 * Showcases all card features and states
 */

// Mock workflow runs data for expanded view testing
const mockAuthors = ['Alice Chen', 'Bob Smith', 'Charlie Davis', 'Diana Miller', 'Ethan Brown'];

export const MOCK_WORKFLOW_RUNS = {
  'demo-pulse-animation': Array.from({ length: 30 }, (_, i) => ({
    id: 1000 + i,
    name: ['CI Pipeline', 'Build & Test', 'Deploy', 'Lint', 'Security Scan'][i % 5],
    status: i === 0 ? 'in_progress' : 'completed',
    conclusion: i === 0 ? null : i % 6 === 0 ? 'failure' : 'success',
    run_number: 123 + i,
    head_branch: i % 4 === 0 ? 'develop' : i % 4 === 1 ? 'feature/new-ui' : i % 4 === 2 ? 'hotfix/critical-bug' : 'main',
    head_sha: `abc${i.toString().padStart(13, '0')}`,
    head_commit: { 
      message: `${['feat', 'fix', 'chore', 'test', 'docs', 'refactor', 'style', 'perf'][i % 8]}: ${[
        'add new feature', 
        'resolve bug in production', 
        'update dependencies',
        'add comprehensive test coverage',
        'improve documentation',
        'refactor legacy code',
        'apply code formatting',
        'optimize performance'
      ][i % 8]}\n\nThis is a longer commit message with multiple lines\nto test how the UI handles more content`,
      author: { name: mockAuthors[i % 5] }
    },
    created_at: new Date(Date.now() - 1000 * 60 * (i + 1) * 3).toISOString(),
    html_url: `https://github.com/demo/repo/actions/runs/${1000 + i}`
  })),
  'demo-success-with-prs': Array.from({ length: 35 }, (_, i) => ({
    id: 2000 + i,
    name: ['CI Pipeline', 'Deploy', 'Test Suite', 'Code Quality', 'Build', 'Integration Tests'][i % 6],
    status: 'completed',
    conclusion: i % 8 === 0 ? 'failure' : i % 8 === 1 ? 'cancelled' : 'success',
    run_number: 234 + i,
    head_branch: i % 5 === 0 ? 'main' : i % 5 === 1 ? 'develop' : i % 5 === 2 ? 'feature/analytics' : i % 5 === 3 ? 'feature/settings' : 'feature/dashboard-improvements',
    head_sha: `fed${i.toString().padStart(13, '0')}`,
    head_commit: { 
      message: `${['feat', 'fix', 'chore', 'test', 'docs'][i % 5]}: ${[
        'add new dashboard features with comprehensive analytics',
        'fix critical bug affecting user experience', 
        'update all dependencies to latest versions',
        'add integration tests for all components',
        'update API documentation with examples'
      ][i % 5]}`,
      author: { name: mockAuthors[i % 5] }
    },
    created_at: new Date(Date.now() - 1000 * 60 * (i + 1) * 2).toISOString(),
    html_url: `https://github.com/demo/repo/actions/runs/${2000 + i}`
  })),
  'demo-failure': Array.from({ length: 28 }, (_, i) => ({
    id: 3000 + i,
    name: ['Test Suite', 'Lint', 'Type Check', 'Unit Tests', 'E2E Tests'][i % 5],
    status: 'completed',
    conclusion: i % 3 === 0 ? 'failure' : 'success',
    run_number: 156 + i,
    head_branch: i % 3 === 0 ? 'feature/new-feature' : i % 3 === 1 ? 'feature/bug-fixes' : 'main',
    head_sha: `987${i.toString().padStart(13, '0')}`,
    head_commit: { 
      message: `test: ${[
        'add comprehensive test coverage for all edge cases',
        'fix flaky tests in CI pipeline',
        'improve test reliability and performance',
        'add missing unit tests',
        'update test fixtures and mocks'
      ][i % 5]}`,
      author: { name: mockAuthors[i % 5] }
    },
    created_at: new Date(Date.now() - 1000 * 60 * (i + 1) * 4).toISOString(),
    html_url: `https://github.com/demo/repo/actions/runs/${3000 + i}`
  })),
  'demo-in-progress': Array.from({ length: 25 }, (_, i) => ({
    id: 4000 + i,
    name: ['Deploy to Staging', 'Build', 'Test', 'Package', 'Publish'][i % 5],
    status: i < 3 ? 'in_progress' : 'completed',
    conclusion: i < 3 ? null : i % 7 === 0 ? 'failure' : 'success',
    run_number: 67 + i,
    head_branch: i % 2 === 0 ? 'develop' : 'release/v2.0',
    head_sha: `stg${i.toString().padStart(13, '0')}`,
    head_commit: { 
      message: `${['deploy', 'build', 'release'][i % 3]}: ${[
        'prepare version 2.0 release with new features',
        'build artifacts for production deployment',
        'create release candidate for testing'
      ][i % 3]}`,
      author: { name: mockAuthors[i % 5] }
    },
    created_at: new Date(Date.now() - 1000 * 60 * (i + 1) * 5).toISOString(),
    html_url: `https://github.com/demo/repo/actions/runs/${4000 + i}`
  })),
  'demo-many-topics': Array.from({ length: 40 }, (_, i) => ({
    id: 5000 + i,
    name: ['CI Pipeline', 'Build & Test', 'Deploy', 'Security Scan', 'Lint', 'Type Check', 'Code Coverage', 'Performance Tests'][i % 8],
    status: 'completed',
    conclusion: i % 7 === 0 ? 'failure' : i % 7 === 1 ? 'cancelled' : 'success',
    run_number: 300 + i,
    head_branch: i % 5 === 0 ? 'main' : i % 5 === 1 ? 'develop' : i % 5 === 2 ? `feature/feature-${i}` : i % 5 === 3 ? `bugfix/issue-${i}` : `hotfix/urgent-${i}`,
    head_sha: `com${i.toString().padStart(13, '0')}`,
    head_commit: { 
      message: `${['feat', 'fix', 'chore', 'test', 'docs', 'refactor', 'style', 'perf', 'ci'][i % 9]}: ${[
        'update components with new design system',
        'fix bug in authentication flow', 
        'refactor code for better maintainability',
        'add tests for edge cases',
        'update documentation with examples',
        'optimize build process',
        'apply linting rules',
        'improve performance metrics',
        'update CI/CD pipeline'
      ][i % 9]}\n\nDetailed explanation of changes:\n- Change 1\n- Change 2\n- Change 3`,
      author: { name: mockAuthors[i % 5] }
    },
    created_at: new Date(Date.now() - 1000 * 60 * (i + 1) * 5).toISOString(),
    html_url: `https://github.com/demo/repo/actions/runs/${5000 + i}`
  })),
  'demo-high-pr-count': Array.from({ length: 45 }, (_, i) => ({
    id: 6000 + i,
    name: ['PR Checks', 'CI', 'Build', 'Tests', 'Lint & Format', 'Code Review'][i % 6],
    status: 'completed',
    conclusion: i % 10 === 0 ? 'failure' : 'success',
    run_number: 450 + i,
    head_branch: `pr-${i + 1}`,
    head_sha: `pr${i.toString().padStart(15, '0')}`,
    head_commit: { 
      message: `PR #${i + 1}: ${[
        'various improvements and bug fixes',
        'add new features and enhancements',
        'refactor codebase for better performance',
        'update dependencies and configuration',
        'improve test coverage and reliability'
      ][i % 5]}`,
      author: { name: mockAuthors[i % 5] }
    },
    created_at: new Date(Date.now() - 1000 * 60 * (i + 1) * 3).toISOString(),
    html_url: `https://github.com/demo/repo/actions/runs/${6000 + i}`
  })),
  'demo-warning': Array.from({ length: 20 }, (_, i) => ({
    id: 7000 + i,
    name: ['Long Running Job', 'Nightly Build', 'Full Test Suite'][i % 3],
    status: 'completed',
    conclusion: i % 4 === 0 ? 'cancelled' : i % 4 === 1 ? 'timed_out' : 'success',
    run_number: 126 + i,
    head_branch: 'main',
    head_sha: `wrn${i.toString().padStart(13, '0')}`,
    head_commit: { 
      message: 'chore: cleanup old workflows and optimize',
      author: { name: mockAuthors[i % 5] }
    },
    created_at: new Date(Date.now() - 1000 * 60 * (i + 1) * 10).toISOString(),
    html_url: `https://github.com/demo/repo/actions/runs/${7000 + i}`
  }))
}

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
