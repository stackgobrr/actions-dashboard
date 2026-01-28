# Deployment Guide

Deployment options for the h3ow3d Actions Dashboard.

## Contents

- [AWS S3 + CloudFront (Production)](#aws-s3--cloudfront-production)
- [Docker (Local/Self-Hosted)](#docker-localself-hosted)
- [Vercel (Alternative)](#vercel-alternative)
- [Development Server](#development-server)

---

## AWS S3 + CloudFront (Production)

Deploys as a static website with S3 storage and CloudFront CDN.

### Prerequisites

- AWS CLI configured
- Terraform v1.0 or later

### Steps

```bash
# 1. Configure (optional)
cd infra
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your AWS region and project name

# 2. Deploy infrastructure
make infra-init
make infra-plan
make infra-apply

# 3. Build and deploy website
make deploy

# 4. Get your dashboard URL
make infra-output
```

### Custom Domain

1. Get your Route53 hosted zone ID:
   ```bash
   aws route53 list-hosted-zones
   ```

2. Update `infra/terraform.tfvars`:
   ```hcl
   domain_name = "dashboard.example.com"
   hosted_zone_id = "Z1234567890ABC"
   ```

3. Apply:
   ```bash
   cd infra && terraform apply
   ```

Terraform will:
- Create an ACM certificate in us-east-1
- Add DNS validation records to Route53
- Wait for validation
- Configure CloudFront with the certificate
- Create the Route53 A record

### Updating Content

After making changes:
### Updating Content

After making changes:

```bash
make deploy      # Build + sync + invalidate cache
```

### Troubleshooting

**403 Forbidden**: Run `cd infra && terraform apply` to fix bucket policy

**Old content showing**: Run `make invalidate` to clear CloudFront cache

### Cleanup

Remove all AWS resources:

```bash
make infra-destroy
```

---

## Docker (Local/Self-Hosted)

Run in a Docker container for local development or self-hosted deployments.

### Quick Start

```bash
make docker-build
make docker-run
# or
docker-compose up -d
```

Dashboard available at http://localhost:8080

### Available Commands

```bash
make docker-build    # Build image
make docker-run      # Run container
make docker-logs     # View logs
make docker-stop     # Stop container
make docker-rebuild  # Rebuild and restart
```

### Production

For production with HTTPS, use a reverse proxy like Traefik, nginx-proxy, or Caddy:

```yaml
services:
  dashboard:
    image: h3ow3d-actions-dashboard
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.dashboard.rule=Host(`dashboard.example.com`)"
      - "traefik.http.routers.dashboard.entrypoints=websecure"
      - "traefik.http.routers.dashboard.tls.certresolver=letsencrypt"
```

---

## Vercel (Alternative)

Deploy to Vercel for free hosting with global CDN.

### Deployment

```bash
vercel login
vercel          # Preview
vercel --prod   # Production
```

Or connect your GitHub repository to Vercel for automatic deployments.

---

## Development Server

Run locally for development:

```bash
make dev
# or
npm run dev
```

Dashboard available at http://localhost:3001

---

## Help

If you run into issues:
- Check the [GitHub Issues](https://github.com/h3ow3d/h3ow3d-actions-dashboard/issues)
- Review the main README for setup questions

