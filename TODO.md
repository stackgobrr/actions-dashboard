# Actions Dashboard - TODO

## ✅ Authentication (COMPLETED)

### GitHub App Authentication
- [x] Add GitHub App authentication support
- [x] Client-side token generation using private key
- [x] Auto-refreshing installation tokens (1 hour expiry)
- [x] Store credentials securely in localStorage
- [x] Create setup guide as in-app modal
- [x] Collapsible sections in setup guide
- [x] Validate GitHub App credentials
- [x] Display app installation info in UI

### Personal Access Token
- [x] Support PAT authentication
- [x] Token storage in localStorage
- [x] Simple token input UI
- [x] Link to GitHub token creation

### Auth UI/UX
- [x] Dual authentication selection screen
- [x] Clean configuration form
- [x] In-app setup guide with step-by-step instructions
- [x] Error handling and validation
- [x] Sign out functionality
- [x] User/app info display in header

**Note:** OAuth removed in favor of GitHub Apps (more secure, no backend needed)

---

## Dynamic Configuration

### Repository Configuration
- [ ] Create configuration file format (JSON/YAML)
- [ ] Allow users to specify custom repositories
- [ ] Support multiple GitHub organizations
- [ ] Allow custom repository grouping/categories
- [ ] UI for adding/removing repositories
- [ ] Persist configuration to localStorage
- [ ] Import/export configuration
- [ ] UI to enable/disable specific repositories from view

### Configuration Options
- [ ] GitHub owner/organization (default: h3ow3d)
- [ ] Custom repository list with metadata:
  - Repository name
  - Display name (optional)
  - Description
  - Category
  - Workflow file filter (optional)
- [ ] Theme preferences
- [ ] Default sort order
- [ ] Auto-refresh settings
- [ ] Display preferences (columns, card size, etc.)

### Configuration UI
- [ ] Settings modal/page
- [ ] Repository management interface
- [ ] Drag-and-drop reordering
- [ ] Category management
- [ ] Configuration validation
- [ ] Reset to defaults option

### Configuration Storage
- [ ] localStorage for user preferences
- [ ] Optional: Backend API for shared configs
- [ ] Optional: GitHub Gist integration for config backup

---

## Additional Features

### Filters & Search
- [ ] Search repositories by name
- [ ] Filter by status (success, failure, in-progress)
- [ ] Filter by category
- [ ] Filter by workflow name
- [ ] Sort by most PRs open

### Pagination & Auto-play
- [ ] Implement pagination for large repository lists
- [ ] Configurable cards per page
- [ ] Auto-play mode with timer-based pagination
- [ ] User controls to enable/disable auto-play
- [ ] Configurable auto-play interval

### Notifications
- [ ] Browser notifications for status changes
- [ ] Desktop notifications support
- [ ] Notification preferences

### Advanced Views
- [ ] Timeline view of workflow runs
- [ ] Detailed workflow logs viewer
- [ ] Job-level status display
- [ ] Workflow run history

### Performance
- [ ] Implement caching strategy
- [ ] Optimize API calls (batch requests)
- [ ] Add loading skeleton screens
- [ ] Implement virtual scrolling for large lists

---

## Technical Debt

- [ ] Add error boundary components
- [ ] Implement proper loading states
- [ ] Add unit tests
- [ ] Add E2E tests
- [ ] Improve accessibility (ARIA labels)
- [ ] Add TypeScript support
- [ ] Document component API
- [ ] Add Storybook for component showcase

---

## Documentation

- [x] User guide for setup (in-app guide)
- [x] GitHub App setup instructions (in-app modal)
- [x] Authentication documentation
- [x] Deployment guide (README)
- [ ] Configuration format documentation
- [ ] API rate limiting documentation
- [ ] Contributing guidelines

---

## Completed Features

### Themes
- [x] Multiple themes: Dark, Light, Gruvbox, Cyberpunk
- [x] Theme switcher in UI
- [x] Keyboard shortcut (T) for theme cycling
- [x] Theme persistence in localStorage

### UI/UX
- [x] Fullscreen mode with keyboard shortcut (F)
- [x] Auto-refresh with configurable intervals
- [x] Keyboard shortcuts (T/R/F)
- [x] Sort by: last run, category, status
- [x] Card layout with workflow details
- [x] Status icons and color coding
- [x] Direct links to workflow runs

### Infrastructure
- [x] Docker support
- [x] AWS S3 + CloudFront deployment
- [x] Terraform infrastructure as code
- [x] GitHub Actions CI/CD
