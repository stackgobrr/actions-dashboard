# h3ow3d Actions Dashboard

Live GitHub Actions status dashboard for all h3ow3d repositories.

## Features

- **Dual Authentication**: GitHub App (recommended) or Personal Access Token
- **Auto-refresh**: Configurable refresh intervals
- **Visual Status**: Colour-coded status indicators
- **Categorised View**: Organised by repository type (common, modules, infra, services)
- **Quick Links**: Direct links to workflow runs
- **Multiple Themes**: Dark, Light, Gruvbox, Cyberpunk
- **Keyboard Shortcuts**: T (theme), R (refresh), F (fullscreen)
- **Fullscreen Mode**: Optimised dashboard view
- **Docker Support**: Run locally in containers
- **AWS Deployment**: Static hosting with S3 + CloudFront CDN

## Authentication

### Option 1: GitHub App (Recommended)

More secure with fine-grained permissions and automatic token refresh.

1. Create a GitHub App at https://github.com/settings/apps
2. Install it on your repositories
3. Run the dashboard and enter your App ID, Installation ID, and Private Key

### Option 2: Personal Access Token

Simpler setup, suitable for personal use.

1. Create a PAT at https://github.com/settings/tokens/new?scopes=repo&description=h3ow3d-dashboard
2. Run the dashboard and enter your token
3. Token is stored securely in your browser

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:3001 and choose your authentication method.

## Deployment Options

### Option 1: AWS S3 + CloudFront (Production)

Deploy as a static website with S3 storage and CloudFront CDN:

```bash
# Deploy infrastructure
make infra-init
make infra-apply

# Build and deploy website
make deploy

# Get your dashboard URL
make infra-output
```

This gives you:
- Static file hosting
- Global CDN with edge caching
- Low cost (~£0.10-2/month)
- Instant loading
- HTTPS included
- Automated deployment via GitHub Actions

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for the full guide.

### Option 2: Local Docker

Run locally in a container:

```bash
# Build and run
make docker-build
make docker-run

# Or use docker-compose
docker-compose up -d
```

Dashboard available at http://localhost:8080

### Option 3: Development

Run local development server:

```bash
make dev
# or
npm run dev
```

Dashboard available at http://localhost:3001

### Makefile Commands

**Development**:
```bash
make install           # Install dependencies
make dev               # Run development server
make build             # Build for production
make preview           # Preview production build
```

**Docker (Local)**:
```bash
make docker-build      # Build Docker image
make docker-run        # Run Docker container
make docker-stop       # Stop container
make docker-logs       # View container logs
make docker-rebuild    # Rebuild and restart
make up                # Quick rebuild and run
make down              # Quick stop
```

**AWS S3/CloudFront (Production)**:
```bash
make infra-init        # Initialize Terraform
make infra-plan        # Preview infrastructure changes
make infra-apply       # Deploy infrastructure
make build             # Build React app
make sync              # Sync files to S3
make invalidate        # Invalidate CloudFront cache
make deploy            # Build + sync + invalidate (full deploy)
make infra-destroy     # Remove all AWS resources
```

**Utilities**:
```bash
make help              # Show all available commands
make clean             # Clean build artifacts
```

## Setup (Development)

1. **Install dependencies**:
   ```bash
   make install
   # or
   npm install
   ```

2. **Run development server**:
   ```bash
   make dev
   # or
   npm run dev
   ```

3. **Open in browser**: http://localhost:3000

## GitHub Token Configuration

When you first open the dashboard (either Docker or dev), it will ask for a GitHub Personal Access Token:

1. **Create token**: [Create here](https://github.com/settings/tokens/new?scopes=repo&description=h3ow3d-dashboard)
2. **Required scope**: `repo`
3. **Enter in dashboard**: Token is stored in browser localStorage
4. **Security**: Token never leaves your browser (only sent to GitHub API)

## Build for Production

```bash
# Build static files
make build

# Preview production build
make preview

# Build Docker image
make docker-build
```

## Docker Deployment

### Using Makefile (Recommended)
```bash
make docker-rebuild
```

### Using Docker Compose
```bash
docker-compose up -d
docker-compose logs -f
docker-compose down
```

### Manual Docker Commands
```bash
# Build
docker build -t h3ow3d-actions-dashboard .

# Run
docker run -d --name h3ow3d-dashboard -p 8080:80 h3ow3d-actions-dashboard
```

## AWS S3/CloudFront Deployment

Deploy the dashboard as a static website with global CDN.

### Quick Start

```bash
# 1. Configure backend (one time)
cd infra
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your settings

# 2. Deploy infrastructure
make infra-init
make infra-apply

# 3. Build and deploy website
make deploy

# 4. Get your dashboard URL
make infra-output
```

### Features

- **S3 Static Hosting**: Secure, private S3 bucket
- **CloudFront CDN**: Global edge caching for fast delivery
- **Cost-effective**: ~$0.10-2/month for typical usage
- **HTTPS included**: Via CloudFront with optional custom domain
- **Auto-deploy**: GitHub Actions on push to main
- **No cold starts**: Static files load instantly

### Architecture

```
GitHub Actions (CI/CD)
       ↓
   S3 Bucket (Private)
       ↓
CloudFront CDN (Global)
       ↓
   HTTPS Website
```

### Detailed Guide

See **[DEPLOYMENT.md](docs/DEPLOYMENT.md)** for:
- Complete setup instructions
- Infrastructure configuration
- Custom domain setup
- Monitoring and optimization
- Troubleshooting
- Security best practices

### Monitoring

```bash
# View Terraform outputs
make infra-output

# Invalidate CloudFront cache
make invalidate

# Deploy updates
make deploy
```

## Development Setup

1. **Install dependencies**:
   ```bash
   make install
   # or
   npm install
   ```

2. **Run development server**:
   ```bash
   make dev
   # or
   npm run dev
   ```

3. **Open in browser**: http://localhost:3001

# Run
docker run -d \
  --name h3ow3d-dashboard \
  -p 8080:80 \
  --restart unless-stopped \
  h3ow3d-actions-dashboard

# View logs
docker logs -f h3ow3d-dashboard

# Stop
docker stop h3ow3d-dashboard
docker rm h3ow3d-dashboard
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

## Customisation

To add or remove repositories, edit `REPOSITORIES` in `src/constants.js`:

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
