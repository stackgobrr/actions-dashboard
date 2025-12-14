# Primer Migration Plan

## Current State
- Using Primer CSS (v22.0.2) with custom CSS
- Custom React components
- Lucide React icons
- Working dashboard with responsive grid

## Goal
- Fully Primer-based application
- Use @primer/react components
- Use @primer/octicons-react icons
- Proper component architecture
- Test coverage at each stage

## Phase 1: Foundation & Testing Setup

### 1.1 Add Testing Infrastructure
```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

**Files to create:**
- `vitest.config.js` - Test configuration
- `src/setupTests.js` - Test setup
- `src/__tests__/App.test.jsx` - Initial smoke tests

**Tests to write:**
- Dashboard renders
- Auth flow works
- Refresh button functions
- Theme switching works

### 1.2 Component Breakdown Planning
Current monolithic `App.jsx` (~900 lines) should be split into:

```
src/
  components/
    Dashboard/
      Dashboard.jsx          - Main container
      DashboardHeader.jsx    - Header with controls
      DashboardGrid.jsx      - Grid layout
      RepoCard.jsx          - Individual repo card
      RepoCard.test.jsx     - Card tests
    Auth/
      AuthSetup.jsx         - Auth selection page
      GitHubAppForm.jsx     - GitHub App config
      PatForm.jsx           - Personal token form
    UI/
      ThemeToggle.jsx       - Theme switcher
      RefreshButton.jsx     - Refresh control
      FullscreenToggle.jsx  - Fullscreen button
  hooks/
    useGitHubStatus.js     - Fetch repo statuses
    useAuth.js            - Auth state management
    useTheme.js           - Theme management
  utils/
    statusHelpers.js      - Status icon/color logic
    gridHelpers.js        - Column calculation
  constants.js            - REPOSITORIES config
```

## Phase 2: Incremental Migration

### 2.1 Icons Migration (Low Risk)
**Branch:** `feat/migrate-icons`
- Replace all Lucide icons with Octicons
- Test: Visual regression, no functionality change
- Commit: "feat: migrate to octicons"

### 2.2 Button Components (Low Risk)
**Branch:** `feat/primer-buttons`
- Replace HTML buttons with Primer Button
- Replace icon buttons with IconButton
- Test: Click handlers still work
- Commit: "feat: migrate buttons to Primer React"

### 2.3 Form Components (Medium Risk)
**Branch:** `feat/primer-forms`
- Replace select dropdowns with Primer Select
- Replace inputs with Primer TextInput
- Test: Form submissions work
- Commit: "feat: migrate forms to Primer React"

### 2.4 Extract RepoCard Component (Medium Risk)
**Branch:** `feat/extract-repo-card`
- Create `components/Dashboard/RepoCard.jsx`
- Move card rendering logic
- Keep existing CSS classes
- Write tests for RepoCard
- Commit: "refactor: extract RepoCard component"

### 2.5 Migrate RepoCard to Primer (High Risk)
**Branch:** `feat/primer-repo-card`
- Use Primer components inside RepoCard
- Replace custom CSS with Primer utilities
- Test: Card renders correctly, interactions work
- Commit: "feat: migrate RepoCard to Primer React"

### 2.6 Extract Auth Components (Medium Risk)
**Branch:** `feat/extract-auth`
- Create `components/Auth/` folder
- Split auth logic into subcomponents
- Write tests for auth flows
- Commit: "refactor: extract auth components"

### 2.7 Extract Hooks (Low Risk)
**Branch:** `feat/extract-hooks`
- Create `hooks/useGitHubStatus.js`
- Create `hooks/useAuth.js`
- Create `hooks/useTheme.js`
- Test: Hooks work in isolation
- Commit: "refactor: extract custom hooks"

### 2.8 Dashboard Layout Migration (High Risk)
**Branch:** `feat/primer-dashboard-layout`
- Migrate grid container to Primer approach
- Use CSS Grid with Primer utilities
- Test: Responsive behavior works
- Commit: "feat: migrate dashboard layout to Primer"

### 2.9 Theme System Integration (Medium Risk)
**Branch:** `feat/primer-theme-provider`
- Integrate Primer ThemeProvider
- Sync with existing theme state
- Test: Theme switching works
- Commit: "feat: integrate Primer ThemeProvider"

### 2.10 Final CSS Cleanup (Low Risk)
**Branch:** `feat/cleanup-custom-css`
- Remove unused custom CSS
- Document remaining custom styles
- Test: No visual regressions
- Commit: "chore: cleanup custom CSS"

## Phase 3: Quality & Polish

### 3.1 Add E2E Tests
- Test full user flows
- Test responsive behavior
- Test auth flows

### 3.2 Performance Optimization
- Code splitting
- Lazy loading
- Bundle size analysis

### 3.3 Accessibility Audit
- Keyboard navigation
- Screen reader support
- ARIA labels

### 3.4 Documentation
- Component API docs
- Development guide
- Deployment guide

## Testing Strategy

### Unit Tests
```javascript
// Example: RepoCard.test.jsx
import { render, screen } from '@testing-library/react'
import { RepoCard } from './RepoCard'

test('renders repo name', () => {
  render(<RepoCard name="test-repo" status="success" />)
  expect(screen.getByText('test-repo')).toBeInTheDocument()
})

test('shows correct status icon', () => {
  const { container } = render(<RepoCard status="success" />)
  expect(container.querySelector('.CheckCircleIcon')).toBeInTheDocument()
})
```

### Integration Tests
```javascript
// Example: Dashboard.test.jsx
test('fetches and displays repo statuses', async () => {
  render(<Dashboard />)
  await waitFor(() => {
    expect(screen.getByText('h3ow3d-deployment')).toBeInTheDocument()
  })
})
```

## Risk Mitigation

1. **Branch per feature** - Easy to revert if broken
2. **Tests before refactor** - Ensure no regression
3. **Small commits** - Easy to debug
4. **Visual regression testing** - Take screenshots at each stage
5. **Staged rollout** - Keep main branch always deployable

## Success Criteria

- [ ] All tests passing
- [ ] No custom CSS (or minimal, documented)
- [ ] All components from Primer React
- [ ] Code coverage > 80%
- [ ] Bundle size < 500KB
- [ ] Lighthouse score > 95
- [ ] Full accessibility compliance

## Timeline Estimate

- Phase 1: 1-2 days (Setup + Planning)
- Phase 2: 1-2 weeks (Incremental migration, ~2-3 features per day)
- Phase 3: 2-3 days (Polish + Documentation)

**Total: ~2-3 weeks** for complete, tested migration

## Next Steps

1. ✅ Create this migration plan
2. Create feature branch for testing setup
3. Add vitest configuration
4. Write initial smoke tests
5. Begin Phase 2.1 (Icons migration)
