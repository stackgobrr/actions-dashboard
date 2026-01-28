# Actions Dashboard

Real-time monitoring dashboard for GitHub Actions workflows.

## Features

- **Dual Authentication**: GitHub App or Personal Access Token
- **Auto-refresh**: Configurable refresh intervals
- **Multiple Themes**: Dark, Light, Gruvbox, Cyberpunk
- **Keyboard Shortcuts**: T (theme), R (refresh), F (fullscreen), S (settings)
- **Repository Management**: Add/remove repos via settings
- **AWS Deployment**: S3 + CloudFront with CDN
- **Docker Support**: Local containerised deployment

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:3001 and configure authentication.

## Authentication

**GitHub App (Recommended)**: More secure with fine-grained permissions.
1. Create at https://github.com/settings/apps
2. Install on your repositories
3. Enter App ID, Installation ID, and Private Key

**Personal Access Token**: Simpler for personal use.
1. Create at https://github.com/settings/tokens/new?scopes=repo
2. Enter token in dashboard

## Deployment

### AWS (Production)

```bash
make infra-init
make infra-apply
make deploy
```

Low cost (~£0.10-2/month), global CDN, HTTPS included. See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for details.

### Docker (Local)

```bash
make docker-build
make docker-run
# or
docker-compose up -d
```

Dashboard at http://localhost:8080

## Development

```bash
make dev              # Start dev server
make build            # Build for production
make preview          # Preview production build
make test             # Run tests
```

## Customisation

Edit repositories in settings UI or modify `src/constants.js`.

## Tech Stack

React 18 • Vite • Primer CSS • GitHub API • Terraform • AWS S3/CloudFront

## License

MIT
