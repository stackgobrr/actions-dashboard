/**
 * Mock repository data for demo mode
 * Simulates a real-world dashboard with realistic repository names and dynamic updates
 * 
 * Now using RepoDataService for unified data management
 */

import { repoDataService } from '../services/RepoDataService'

// Helper to generate random data
const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomChoice = (arr) => arr[random(0, arr.length - 1)];
const randomBool = (probability = 0.5) => Math.random() < probability;

// Realistic data pools
const mockAuthors = [
  'Sarah Martinez', 'Alex Chen', 'Jordan Taylor', 'Morgan Kim', 
  'Casey Brown', 'Riley Johnson', 'Drew Wilson', 'Sam Davis',
  'Taylor Anderson', 'Blake Foster', 'Avery Mitchell', 'Quinn Roberts'
];

// Map workflows to repos for more realistic behavior
const repoWorkflowsMap = {
  'api-gateway': ['API Tests', 'Deploy to Staging', 'Deploy to Production', 'Security Scan', 'Load Tests'],
  'frontend-app': ['Build & Test', 'E2E Tests', 'Deploy Preview', 'Lighthouse CI', 'Deploy to Production'],
  'ml-pipeline': ['Train Model', 'Validate Dataset', 'Deploy Model', 'Performance Tests', 'Data Quality Checks'],
  'mobile-app': ['iOS Build', 'Android Build', 'E2E Tests', 'Deploy to TestFlight', 'Deploy to Play Store'],
  'data-processor': ['Integration Tests', 'Deploy to Staging', 'Data Validation', 'Performance Benchmark'],
  'auth-service': ['Security Tests', 'Integration Tests', 'Deploy to Staging', 'Deploy to Production'],
  'notification-service': ['Unit Tests', 'Integration Tests', 'Deploy to Staging', 'Load Tests'],
  'payment-gateway': ['Security Scan', 'Compliance Tests', 'Deploy to Staging', 'Deploy to Production', 'PCI Audit'],
  'analytics-dashboard': ['Build UI', 'E2E Tests', 'Deploy Preview', 'Deploy to Production'],
  'infrastructure': ['Terraform Plan', 'Terraform Apply', 'Security Scan', 'Cost Analysis']
};

// More realistic branch patterns per repo type
const getRealisticBranches = (repoName) => {
  const common = ['main', 'develop', 'staging'];
  const features = [
    'feature/user-authentication', 'feature/api-optimization', 'feature/new-dashboard',
    'feature/payment-integration', 'feature/analytics', 'feature/notifications',
    'feature/caching', 'feature/performance'
  ];
  const fixes = ['fix/memory-leak', 'fix/validation-bug', 'fix/race-condition', 'hotfix/security-patch'];
  const releases = ['release/v2.1.0', 'release/v2.0.5', 'release/v1.9.8'];
  
  return [...common, ...features.slice(0, 3), ...fixes.slice(0, 2), ...releases.slice(0, 1)];
};

// More varied commit messages
const commitTemplates = {
  feat: [
    'add user authentication with OAuth2',
    'implement caching layer for API responses',
    'add real-time notifications via WebSockets',
    'implement feature flags system',
    'add comprehensive error tracking',
    'implement rate limiting middleware'
  ],
  fix: [
    'resolve race condition in payment processing',
    'fix memory leak in event listeners',
    'correct timezone handling in analytics',
    'resolve CORS issues for cross-origin requests',
    'fix validation logic for edge cases',
    'patch security vulnerability in dependencies'
  ],
  chore: [
    'upgrade dependencies to latest stable versions',
    'update Docker base images',
    'refactor configuration management',
    'improve logging and monitoring',
    'optimize build process',
    'cleanup deprecated code'
  ],
  test: [
    'add integration tests for payment flow',
    'improve test coverage to 85%',
    'add E2E tests for critical user paths',
    'update test fixtures and mocks',
    'add performance regression tests'
  ],
  docs: [
    'update API documentation with new endpoints',
    'add architecture decision records',
    'improve onboarding documentation',
    'document deployment process'
  ],
  refactor: [
    'restructure authentication module',
    'optimize database query patterns',
    'improve error handling architecture',
    'simplify state management logic'
  ],
  perf: [
    'optimize bundle size by 30%',
    'reduce initial load time',
    'implement lazy loading for routes',
    'optimize image compression'
  ],
  ci: [
    'update CI pipeline configuration',
    'add automated deployment workflows',
    'improve build caching',
    'add security scanning to pipeline'
  ]
};

// Generate realistic initial mock runs
const generateInitialMockRuns = (repoName, repoId, count) => {
  const workflows = repoWorkflowsMap[repoName] || ['CI/CD Pipeline', 'Deploy', 'Tests'];
  const branches = getRealisticBranches(repoName);
  
  return Array.from({ length: count }, (_, i) => {
    const isRecent = i === 0;
    const minutesAgo = i * random(8, 25) + random(2, 15); // More varied spacing
    
    // First run might be in progress, others mostly completed
    let status, conclusion;
    if (isRecent && random(0, 100) < 20) {
      status = random(0, 100) < 75 ? 'in_progress' : 'queued';
      conclusion = null;
    } else {
      status = 'completed';
      const roll = random(0, 100);
      if (roll < 80) conclusion = 'success'; // 80% success rate
      else if (roll < 93) conclusion = 'failure'; // 13% failure
      else conclusion = randomChoice(['cancelled', 'timed_out']); // 7% other
    }
    
    const commitType = randomChoice(Object.keys(commitTemplates));
    const commitMsg = randomChoice(commitTemplates[commitType]);
    
    return {
      id: repoId * 10000 + i + Date.now(),
      name: workflows[i % workflows.length],
      status,
      conclusion,
      run_number: 100 + count - i + random(0, 20),
      head_branch: branches[i % branches.length],
      head_sha: `${Math.random().toString(36).substring(2, 9)}${i.toString().padStart(6, '0')}`,
      head_commit: {
        message: `${commitType}: ${commitMsg}`,
        author: { name: mockAuthors[i % mockAuthors.length] }
      },
      created_at: new Date(Date.now() - 1000 * 60 * minutesAgo).toISOString(),
      html_url: `https://github.com/acme/${repoName}/actions/runs/${repoId * 10000 + i}`
    };
  });
};

// Simulate live workflow runs being added at random intervals
const repoIds = {
  'api-gateway': 1,
  'frontend-app': 2,
  'ml-pipeline': 3,
  'mobile-app': 4,
  'data-processor': 5,
  'auth-service': 6,
  'notification-service': 7,
  'payment-gateway': 8,
  'analytics-dashboard': 9,
  'infrastructure': 10
};

const repoNames = Object.keys(repoIds);
const initialRunCounts = {
  'api-gateway': 8, 'frontend-app': 6, 'ml-pipeline': 5,
  'mobile-app': 7, 'data-processor': 6, 'auth-service': 9,
  'notification-service': 5, 'payment-gateway': 7,
  'analytics-dashboard': 6, 'infrastructure': 5
};

// Tracking for live simulation
let lastEventTime = Date.now();
const eventInterval = 10000; // New event every 10 seconds

// Track activity level per repo (some repos are more active)
const repoActivityLevels = {
  'api-gateway': 0.3,        // High activity
  'frontend-app': 0.25,      // High activity
  'mobile-app': 0.15,        // Medium activity
  'auth-service': 0.1,       // Medium activity
  'data-processor': 0.08,    // Medium-low activity
  'payment-gateway': 0.05,   // Low activity (critical, less frequent deploys)
  'ml-pipeline': 0.03,       // Low activity
  'notification-service': 0.02, // Very low activity
  'analytics-dashboard': 0.015, // Very low activity
  'infrastructure': 0.005    // Very low activity (infrastructure changes are rare)
};

// Initialize all repos with base data using the service
repoNames.forEach((repoName) => {
  const repoId = repoIds[repoName];
  const initialRuns = generateInitialMockRuns(repoName, repoId, initialRunCounts[repoName]);
  repoDataService.setRuns(repoName, initialRuns);
});

// Function to add a new run to a weighted random repo
// Function to add a new run to a weighted random repo
const addRandomEvent = (now) => {
  // Weighted selection based on activity levels
  const totalWeight = Object.values(repoActivityLevels).reduce((sum, w) => sum + w, 0);
  let randomValue = Math.random() * totalWeight;
  let selectedRepo = repoNames[0];
  
  for (const repoName of repoNames) {
    randomValue -= repoActivityLevels[repoName];
    if (randomValue <= 0) {
      selectedRepo = repoName;
      break;
    }
  }
  
  const repoName = selectedRepo;
  const repoId = repoIds[repoName];
  const currentRuns = repoDataService.getRuns(repoName);
  const workflows = repoWorkflowsMap[repoName];
  const branches = getRealisticBranches(repoName);
  
  // Realistic lifecycle: new runs always start as queued/pending
  const commitType = randomChoice(Object.keys(commitTemplates));
  const commitMsg = randomChoice(commitTemplates[commitType]);
  
  // Create new run - always starts as queued
  const newRun = {
    id: Date.now() + repoId + random(1, 100),
    name: randomChoice(workflows),
    status: 'queued',
    conclusion: null,
    run_number: currentRuns.length > 0 ? (currentRuns[0].run_number + 1) : random(100, 200),
    head_branch: randomChoice(branches),
    head_sha: `${Math.random().toString(36).substring(2, 9)}${Date.now().toString(36)}`,
    head_commit: {
      message: `${commitType}: ${commitMsg}`,
      author: { name: randomChoice(mockAuthors) }
    },
    created_at: new Date(now).toISOString(),
    html_url: `https://github.com/acme/${repoName}/actions/runs/${Date.now() + repoId}`
  };
  
  // Add via service (automatically updates timestamps and sequences)
  repoDataService.addRun(repoName, newRun);
  
  // Progress workflow runs through their lifecycle
  // queued -> in_progress -> completed (success/failure)
  repoNames.forEach(repo => {
    const runs = repoDataService.getRuns(repo);
    
    runs.forEach((run, idx) => {
      // Don't update the newest run we just added
      if (idx === 0 && repo === repoName && run.id === newRun.id) return;
      
      // Transition queued -> in_progress (70% chance per tick)
      if (run.status === 'queued' && random(0, 100) < 70) {
        repoDataService.updateRun(repo, run.id, { status: 'in_progress' });
      }
      // Transition in_progress -> completed (50% chance per tick)
      else if (run.status === 'in_progress' && random(0, 100) < 50) {
        // 85% success, 12% failure, 3% cancelled/timed_out
        const conclusionRoll = random(0, 100);
        let conclusion;
        if (conclusionRoll < 85) conclusion = 'success';
        else if (conclusionRoll < 97) conclusion = 'failure';
        else conclusion = randomChoice(['cancelled', 'timed_out']);
        
        repoDataService.updateRun(repo, run.id, { 
          status: 'completed', 
          conclusion 
        });
      }
    });
  });
  
  return true; // Signal that an event was added
};

// Start the event generation interval
let eventIntervalId = null;

const startEventGeneration = () => {
  if (eventIntervalId) return; // Already running
  
  // Add events every 10 seconds
  eventIntervalId = setInterval(() => {
    addRandomEvent(Date.now());
  }, eventInterval);
};

// Auto-start when module loads
startEventGeneration();

// Export getter that reads from service
export const MOCK_WORKFLOW_RUNS = {
  get 'api-gateway'() { return repoDataService.getRuns('api-gateway') },
  get 'frontend-app'() { return repoDataService.getRuns('frontend-app') },
  get 'ml-pipeline'() { return repoDataService.getRuns('ml-pipeline') },
  get 'mobile-app'() { return repoDataService.getRuns('mobile-app') },
  get 'data-processor'() { return repoDataService.getRuns('data-processor') },
  get 'auth-service'() { return repoDataService.getRuns('auth-service') },
  get 'notification-service'() { return repoDataService.getRuns('notification-service') },
  get 'payment-gateway'() { return repoDataService.getRuns('payment-gateway') },
  get 'analytics-dashboard'() { return repoDataService.getRuns('analytics-dashboard') },
  get 'infrastructure'() { return repoDataService.getRuns('infrastructure') }
};

// Initialize static repo metadata in the service
const initializeRepoMetadata = () => {
  const baseRepoData = {
    'api-gateway': {
      category: 'backend',
      description: 'Core API gateway handling all service routing',
      url: 'https://github.com/acme/api-gateway',
      openPRCount: 3,
      topics: ['api', 'gateway', 'microservices', 'node']
    },
    
    'frontend-app': {
      category: 'frontend',
      description: 'Main user-facing web application',
      url: 'https://github.com/acme/frontend-app',
      openPRCount: 5,
      topics: ['react', 'typescript', 'vite', 'ui']
    },
    
    'ml-pipeline': {
      category: 'data',
      description: 'Machine learning training and inference pipeline',
      url: 'https://github.com/acme/ml-pipeline',
      openPRCount: 2,
      topics: ['python', 'machine-learning', 'tensorflow', 'airflow']
    },
    
    'mobile-app': {
      category: 'mobile',
      description: 'iOS and Android mobile application',
      url: 'https://github.com/acme/mobile-app',
      openPRCount: 8,
      topics: ['react-native', 'mobile', 'ios', 'android']
    },
    
    'data-processor': {
      category: 'data',
      description: 'High-throughput data processing service',
      url: 'https://github.com/acme/data-processor',
      openPRCount: 1,
      topics: ['kafka', 'spark', 'scala', 'streaming']
    },
    
    'auth-service': {
      category: 'backend',
      description: 'Authentication and authorization service',
      url: 'https://github.com/acme/auth-service',
      openPRCount: 12,
      topics: ['oauth', 'jwt', 'security', 'golang']
    },
    
    'notification-service': {
      category: 'backend',
      description: 'Multi-channel notification delivery system',
      url: 'https://github.com/acme/notification-service',
      openPRCount: 0,
      topics: ['notifications', 'email', 'sms', 'push']
    },
    
    'payment-gateway': {
      category: 'backend',
      description: 'Secure payment processing and billing',
      url: 'https://github.com/acme/payment-gateway',
      openPRCount: 4,
      topics: ['payments', 'stripe', 'security', 'compliance']
    },
    
    'analytics-dashboard': {
      category: 'frontend',
      description: 'Internal analytics and reporting dashboard',
      url: 'https://github.com/acme/analytics-dashboard',
      openPRCount: 2,
      topics: ['analytics', 'visualization', 'd3', 'dashboard']
    },
    
    'infrastructure': {
      category: 'infrastructure',
      description: 'Infrastructure as code and deployment configs',
      url: 'https://github.com/acme/infrastructure',
      openPRCount: 1,
      topics: ['terraform', 'kubernetes', 'aws', 'devops']
    }
  };

  // Set metadata in service for each repo
  Object.entries(baseRepoData).forEach(([repoName, metadata]) => {
    repoDataService.setRepoMetadata(repoName, metadata);
  });
};

// Initialize metadata on module load
initializeRepoMetadata();

// Export unified status getter that uses the service
export const MOCK_REPO_STATUSES = {
  get 'api-gateway'() { return repoDataService.getRepoData('api-gateway') },
  get 'frontend-app'() { return repoDataService.getRepoData('frontend-app') },
  get 'ml-pipeline'() { return repoDataService.getRepoData('ml-pipeline') },
  get 'mobile-app'() { return repoDataService.getRepoData('mobile-app') },
  get 'data-processor'() { return repoDataService.getRepoData('data-processor') },
  get 'auth-service'() { return repoDataService.getRepoData('auth-service') },
  get 'notification-service'() { return repoDataService.getRepoData('notification-service') },
  get 'payment-gateway'() { return repoDataService.getRepoData('payment-gateway') },
  get 'analytics-dashboard'() { return repoDataService.getRepoData('analytics-dashboard') },
  get 'infrastructure'() { return repoDataService.getRepoData('infrastructure') }
};
