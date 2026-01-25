import { useState, useEffect } from 'react'
import {
  ZapIcon,
  ShieldLockIcon,
  WorkflowIcon,
  EyeIcon,
  FilterIcon,
  CommandPaletteIcon,
  MarkGithubIcon,
  MoonIcon,
  SunIcon,
  ChevronRightIcon,
  CheckIcon,
  RocketIcon,
  GearIcon,
  PeopleIcon,
  OrganizationIcon,
  DownloadIcon
} from '@primer/octicons-react'
import { Button, IconButton, Label, Text, Heading } from '@primer/react'
import { RepoCard } from '../Dashboard/RepoCard'
import '../../styles/shared.css'
import './LandingPage.css'

export function LandingPage({ onGetStarted, onViewRoadmap, onViewDemo, theme, setTheme }) {
  const [activeFeature, setActiveFeature] = useState(0)
  const [demoStatusIndex, setDemoStatusIndex] = useState(0)

  // Cycle through different statuses for the demo card
  const demoStatuses = [
    {
      status: 'in_progress',
      conclusion: null,
      workflow: 'Deploy to Staging',
      branch: 'develop',
      commitMessage: 'deploy: prepare version 2...'
    },
    {
      status: 'completed',
      conclusion: 'success',
      workflow: 'Deploy to Staging',
      branch: 'develop',
      commitMessage: 'deploy: prepare version 2...'
    },
    {
      status: 'completed',
      conclusion: 'failure',
      workflow: 'Test Suite',
      branch: 'develop',
      commitMessage: 'test: add comprehensive te...'
    },
    {
      status: 'in_progress',
      conclusion: null,
      workflow: 'Build & Test',
      branch: 'main',
      commitMessage: 'feat: implement new featu...'
    }
  ]

  // Cycle through statuses every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setDemoStatusIndex((prev) => (prev + 1) % demoStatuses.length)
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  // Demo data for preview cards
  const demoRepos = [
    {
      name: 'demo-frontend',
      status: {
        status: 'completed',
        conclusion: 'success',
        workflow: 'Build UI',
        branch: 'main',
        commitMessage: 'ui: update component libra...',
        description: 'Frontend application repository',
        topics: ['react', 'ui', 'frontend'],
        url: '#',
        openPRCount: 0
      }
    },
    {
      name: 'demo-in-progress',
      status: {
        ...demoStatuses[demoStatusIndex],
        description: 'Currently running workflow',
        topics: ['deployment', 'staging'],
        url: '#',
        openPRCount: 0
      }
    },
    {
      name: 'demo-backend',
      status: {
        status: 'completed',
        conclusion: 'success',
        workflow: 'API Tests',
        branch: 'main',
        commitMessage: 'api: add new endpoints',
        description: 'Backend API service',
        topics: ['api', 'backend', 'nodejs'],
        url: '#',
        openPRCount: 0
      }
    },
    {
      name: 'demo-failure',
      status: {
        status: 'completed',
        conclusion: 'failure',
        workflow: 'Test Suite',
        branch: 'feature/new-feature',
        commitMessage: 'test: add comprehensive te...',
        description: 'Failed workflow example',
        topics: ['testing', 'ci-cd'],
        url: '#',
        openPRCount: 1
      }
    }
  ]

  const features = [
    {
      icon: <RocketIcon size={24} />,
      title: "Workflow Monitoring",
      description: "Monitor all your GitHub Actions workflows in one unified dashboard with automatic status updates."
    },
    {
      icon: <WorkflowIcon size={24} />,
      title: "Multi-Repository Support",
      description: "Track workflows across multiple repositories, organized by categories like modules, services, and infrastructure."
    },
    {
      icon: <ShieldLockIcon size={24} />,
      title: "Secure Authentication",
      description: "Support for Personal Access Tokens and GitHub Apps. All credentials stored locally in your browser."
    },
    {
      icon: <EyeIcon size={24} />,
      title: "Visual Status Indicators",
      description: "Clear color-coded status for success, failure, and in-progress workflows with detailed workflow information."
    },
    {
      icon: <FilterIcon size={24} />,
      title: "Smart Filtering",
      description: "Filter workflows by status, search by name, or organize by workflow labels and categories."
    },
    {
      icon: <CommandPaletteIcon size={24} />,
      title: "Keyboard Shortcuts",
      description: "Navigate and control the dashboard efficiently with intuitive keyboard shortcuts."
    }
  ]

  const stats = [
    { value: "Real-time", label: "Updates" },
    { value: "Unlimited", label: "Repositories" },
    { value: "100%", label: "Local Storage" },
    { value: "Open", label: "Source" }
  ]

  const useCases = [
    {
      title: "DevOps Teams",
      description: "Monitor CI/CD pipelines across all your projects in a single view",
      icon: <PeopleIcon size={32} />
    },
    {
      title: "Open Source Maintainers",
      description: "Keep track of automated tests and releases across multiple repositories",
      icon: <MarkGithubIcon size={32} />
    },
    {
      title: "Engineering Managers",
      description: "Get visibility into deployment status and workflow health at a glance",
      icon: <OrganizationIcon size={32} />
    }
  ]

  return (
    <div className={`landing-page`} style={{ background: 'var(--bgColor-default)', color: 'var(--fgColor-default)' }}>
      {/* Header */}
      <header className="landing-header">
        <div className="container">
          <div className="d-flex flex-justify-between flex-items-center">
            <div className="d-flex flex-items-center" style={{ gap: '12px' }}>
              <RocketIcon size={28} />
              <Text sx={{ fontSize: 3, fontWeight: 'semibold' }}>Actions Dashboard</Text>
            </div>
            <div className="d-flex flex-items-center" style={{ gap: '16px' }}>
              <Button
                variant="invisible"
                onClick={onViewRoadmap}
              >
                Roadmap
              </Button>
              <IconButton
                icon={theme === 'dark' ? SunIcon : MoonIcon}
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                aria-label="Toggle theme"
                className="color-fg-muted"
              />
              <Button variant="primary" onClick={onGetStarted} trailingVisual={ChevronRightIcon}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge" sx={{ mb: 4 }}>
              <Label variant="accent" size="large" sx={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                <ZapIcon size={14} />
                Open source
              </Label>
            </div>
            <Heading as="h1" sx={{ fontSize: [6, 7, 8], fontWeight: 'bold', lineHeight: 'condensed', mb: 4 }}>
              Monitor Your GitHub Actions with Live Updates
            </Heading>
            <p className="hero-description">
              A beautiful, powerful dashboard for monitoring GitHub Actions workflows across all your repositories. 
              Built with React, secured with your choice of authentication, and designed for teams who ship fast.
            </p>
            <div className="hero-actions">
              <Button
                variant="primary"
                size="large"
                leadingVisual={RocketIcon}
                trailingVisual={ChevronRightIcon}
                onClick={onGetStarted}
              >
                Get started
              </Button>
              <Button
                variant="outline"
                size="large"
                leadingVisual={MarkGithubIcon}
                onClick={() => { window.location.href = '/api/oauth/start' }}
              >
                Sign in with GitHub
              </Button>
              <Button
                variant="default"
                size="large"
                leadingVisual={EyeIcon}
                onClick={() => {
                  window.plausible?.('Auth Method Selected', { props: { method: 'demo' } })
                  onViewDemo()
                }}
              >
                View demo
              </Button>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="hero-visual">
            <div className="dashboard-preview">
              <div className="preview-header">
                <div className="preview-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div className="preview-title">GitHub Actions Dashboard</div>
              </div>
              <div className="preview-content">
                <div className="preview-cards-grid">
                  {demoRepos.map((repo) => (
                    <RepoCard
                      key={repo.name}
                      repoName={repo.name}
                      status={repo.status}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>Everything you need to monitor workflows</h2>
            <p>Powerful features designed for modern development teams</p>
          </div>
          
          <div className="features-grid">
            {features.map((feature, idx) => (
              <div 
                key={idx} 
                className={`feature-card ${activeFeature === idx ? 'active' : ''}`}
                onMouseEnter={() => setActiveFeature(idx)}
              >
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="use-cases-section">
        <div className="container">
          <div className="section-header">
            <h2>Built for teams of all sizes</h2>
            <p>From solo developers to enterprise teams</p>
          </div>
          
          <div className="use-cases-grid">
            {useCases.map((useCase, idx) => (
              <div key={idx} className="use-case-card">
                <div className="use-case-icon">{useCase.icon}</div>
                <h3>{useCase.title}</h3>
                <p>{useCase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works-section">
        <div className="container">
          <div className="section-header">
            <h2>Get started in seconds</h2>
            <p>Three simple steps to monitor your workflows</p>
          </div>
          
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Connect GitHub</h3>
                <p>Authenticate with a Personal Access Token or GitHub App</p>
                <div className="step-visual">
                  <ShieldLockIcon size={40} />
                </div>
              </div>
            </div>
            
            <div className="step-connector"></div>
            
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Select Repositories</h3>
                <p>Choose which repositories you want to monitor</p>
                <div className="step-visual">
                  <GearIcon size={40} />
                </div>
              </div>
            </div>
            
            <div className="step-connector"></div>
            
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Monitor Workflows</h3>
                <p>Watch your workflows update live</p>
                <div className="step-visual">
                  <RocketIcon size={40} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container" sx={{ textAlign: 'center' }}>
          <div className="cta-content" sx={{ maxWidth: '700px', mx: 'auto' }}>
            <Heading as="h2" sx={{ fontSize: 6, fontWeight: 'bold', color: 'white', mb: 3 }}>
              Ready to monitor your workflows?
            </Heading>
            <Text as="p" sx={{ fontSize: 3, color: 'rgba(255, 255, 255, 0.9)', mb: 5 }}>
              Start tracking your GitHub Actions in seconds. No signup required.
            </Text>
            <div className="d-flex flex-justify-center" sx={{ gap: 3 }}>
              <Button 
                variant="primary"
                size="large"
                leadingVisual={RocketIcon}
                trailingVisual={ChevronRightIcon}
                onClick={onGetStarted}
                sx={{ bg: 'white !important', color: 'accent.fg !important' }}
              >
                Get Started Now
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <div className="d-flex flex-justify-between flex-items-center flex-wrap" sx={{ gap: 4, mb: 5 }}>
            <div className="d-flex flex-items-center" sx={{ gap: 2 }}>
              <RocketIcon size={24} />
              <Text sx={{ fontSize: 3, fontWeight: 'semibold' }}>Actions Dashboard</Text>
            </div>
            <div className="footer-links">
              <a href="https://github.com/h3ow3d/h3ow3d-actions-dashboard" target="_blank" rel="noopener noreferrer" className="color-fg-muted f5">
                GitHub
              </a>
              <a href="https://github.com/h3ow3d/h3ow3d-actions-dashboard/blob/main/docs/DEPLOYMENT.md" target="_blank" rel="noopener noreferrer" className="color-fg-muted f5">
                Documentation
              </a>
              <button onClick={onViewRoadmap} className="color-fg-muted f5" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                Roadmap
              </button>
              <a href="https://github.com/h3ow3d/h3ow3d-actions-dashboard/issues" target="_blank" rel="noopener noreferrer" className="color-fg-muted f5">
                Issues
              </a>
            </div>
          </div>
          <div className="text-center" sx={{ pt: 4, borderTop: '1px solid', borderColor: 'border.default' }}>
            <Text sx={{ color: 'fg.muted', fontSize: 1 }}>
              Built with ❤️ by the h3ow3d team • Open source under MIT License
            </Text>
          </div>
        </div>
      </footer>
    </div>
  )
}
