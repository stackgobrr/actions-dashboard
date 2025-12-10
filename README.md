# h3ow3d Actions Dashboard

Real-time GitHub Actions status dashboard for all h3ow3d repositories.

## Features

- 🔄 **Auto-refresh**: Updates every minute
- 🎨 **Visual Status**: Color-coded status indicators
- 📊 **Categorized View**: Organized by repository type (common, modules, infra, services)
- 🔗 **Quick Links**: Direct links to workflow runs
- 🔐 **Secure**: GitHub token stored locally in browser
- ⚡ **Fast**: Built with React + Vite

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run development server**:
   ```bash
   npm run dev
   ```

3. **Open in browser**: http://localhost:3000

4. **Configure GitHub Token**:
   - Create a GitHub Personal Access Token with `repo` scope
   - [Create token here](https://github.com/settings/tokens/new?scopes=repo&description=h3ow3d-dashboard)
   - Enter token in the dashboard (stored locally)

## Build for Production

```bash
npm run build
npm run preview
```

## Features

### Status Indicators
- ✅ **Green**: Workflow succeeded
- ❌ **Red**: Workflow failed
- 🟠 **Orange**: Workflow in progress
- ⚠️ **Yellow**: Workflow completed with warnings
- ⚪ **Gray**: No runs or error

### Information Displayed
- Workflow name
- Branch name
- Latest commit message
- Link to workflow run
- Last update time

## Repository Categories

- **Common**: Shared workflows and templates
- **Modules**: Terraform infrastructure modules
- **Infra**: Infrastructure deployment
- **Services**: Application services

## Customization

To add or remove repositories, edit `REPOSITORIES` in `src/App.jsx`:

```javascript
const REPOSITORIES = {
  common: [
    { name: 'repo-name', description: 'Description' },
  ],
  // ... more categories
}
```

## Tech Stack

- React 18
- Vite
- Lucide React (icons)
- GitHub REST API

## License

MIT
