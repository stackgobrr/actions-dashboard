# Actions Dashboard - AWS S3/CloudFront Infrastructure

This directory contains Terraform configuration to deploy the Actions Dashboard as a static website on S3 with CloudFront CDN.

## Architecture

```
┌─────────────┐
│   GitHub    │
│   Actions   │
└──────┬──────┘
       │ Build & Deploy
       ▼
┌─────────────┐
│     S3      │  Static Files (HTML, JS, CSS)
│   Bucket    │  (Private - accessed via CloudFront)
└──────┬──────┘
       │
       ▼
┌─────────────┐      ┌──────────────┐
│ CloudFront  │◄─────┤   Optional   │
│ Distribution│      │Custom Domain │
└──────┬──────┘      └──────────────┘
       │
       ▼
    Internet
```

## Features

- **S3 Static Hosting**: Secure, scalable static file storage
- **CloudFront CDN**: Global edge caching for fast delivery
- **Origin Access Control (OAC)**: Secure S3 access without public bucket
- **HTTPS by Default**: Secure connections via CloudFront
- **SPA Routing**: Custom error responses for React Router
- **Cache Optimization**: Long-lived caching for assets, no-cache for HTML
- **Auto-deploy**: GitHub Actions deploys on every push to main
- **Custom Domain Support**: Optional Route 53 + ACM integration

## Prerequisites

1. **AWS Account** with appropriate permissions
2. **AWS CLI** configured with credentials
3. **Terraform** >= 1.14.0
4. **GitHub Secrets** configured:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`

## Quick Start

### 1. Configure Backend

Create a backend configuration file `backend.config`:

```hcl
bucket         = "your-terraform-state-bucket"
key            = "actions-dashboard/terraform.tfstate"
region         = "eu-west-2"
encrypt        = true
dynamodb_table = "terraform-locks"
```

### 2. Initialize Terraform

```bash
cd infra
terraform init -backend-config=backend.config
```

### 3. Configure Variables

Copy and edit the tfvars file:

```bash
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values
```

### 4. Deploy Infrastructure

```bash
terraform plan
terraform apply
```

This creates:
- S3 bucket (private, with versioning)
- CloudFront distribution
- Origin Access Control (OAC)
- Bucket policy for CloudFront access

### 5. Build and Deploy Website

```bash
cd ..
npm install
npm run build

# Sync to S3
make sync

# Invalidate CloudFront cache
make invalidate

# Or do both
make deploy
```

### 6. Get Your Dashboard URL

```bash
terraform -chdir=infra output website_url
# or
make infra-output
```

## GitHub Actions Deployment

Once infrastructure is deployed, GitHub Actions will automatically build and deploy on every push to `main`:

1. Installs dependencies and builds React app
2. Syncs built files to S3
3. Invalidates CloudFront cache
4. Prints the website URL

### Required GitHub Secrets

Add these secrets to your GitHub repository:

```bash
gh secret set AWS_ACCESS_KEY_ID
gh secret set AWS_SECRET_ACCESS_KEY
```

## Configuration Options

### Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `aws_region` | AWS region for S3 | `eu-west-2` |
| `environment` | Environment name | `prod` |
| `project_name` | Project name | `h3ow3d-actions-dashboard` |
| `cloudfront_price_class` | Edge location distribution | `PriceClass_100` |
| `domain_name` | Custom domain (optional) | `""` |
| `certificate_arn` | ACM cert ARN in us-east-1 (optional) | `""` |

### CloudFront Price Classes

- **PriceClass_All**: All edge locations worldwide (most expensive)
- **PriceClass_200**: US, Canada, Europe, Asia, Middle East, Africa
- **PriceClass_100**: US, Canada, Europe only (cheapest)

For a dashboard accessed mainly from EU/US, `PriceClass_100` is sufficient.

### Cache Configuration

The deployment uses optimized caching:
- **Static assets** (JS, CSS, images): 1 year cache (`max-age=31536000`)
- **index.html**: No cache (`max-age=0`) to ensure users always get latest version
- **404/403 errors**: Redirect to `index.html` for SPA routing

## Monitoring

### CloudFront Metrics

Monitor in AWS Console:
- Requests
- Bytes downloaded
- Error rate (4xx, 5xx)
- Cache hit ratio

View metrics:
```bash
aws cloudwatch get-metric-statistics \
  --namespace AWS/CloudFront \
  --metric-name Requests \
  --dimensions Name=DistributionId,Value=$(cd infra && terraform output -raw cloudfront_distribution_id) \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 3600 \
  --statistics Sum
```

### S3 Metrics

Monitor storage and requests in S3 console or CloudWatch.

## Cost Optimization

### S3 Pricing

- **Storage**: $0.023/GB/month (first 50 TB)
- **Requests**: $0.005 per 1,000 PUT, $0.0004 per 1,000 GET
- **This dashboard**: ~5-10 MB storage = **~$0.001/month**

### CloudFront Pricing

- **Free Tier**: 1 TB data transfer out, 10M HTTP requests/month (12 months)
- **After free tier**: 
  - Data transfer: $0.085/GB (first 10 TB, varies by region)
  - Requests: $0.0075 per 10,000 HTTP requests
- **This dashboard**: Likely **$0-2/month** after free tier

### Total Cost

Expected: **$0.10-2/month** (mostly CloudFront, S3 is negligible)

## Custom Domain (Optional)

To use a custom domain:

1. **Request ACM certificate in us-east-1** (CloudFront requires this region):
   ```bash
   aws acm request-certificate \
     --domain-name dashboard.yourdomain.com \
     --validation-method DNS \
     --region us-east-1
   ```

2. **Validate certificate** by adding DNS records shown in ACM console

3. **Update terraform.tfvars**:
   ```hcl
   domain_name     = "dashboard.yourdomain.com"
   certificate_arn = "arn:aws:acm:us-east-1:...:certificate/..."
   ```

4. **Apply changes**:
   ```bash
   cd infra
   terraform apply
   ```

5. **Update DNS** to point to CloudFront:
   ```bash
   # Get CloudFront domain
   terraform output cloudfront_domain_name
   
   # Create CNAME or A (alias) record:
   # dashboard.yourdomain.com -> d1234abcd.cloudfront.net
   ```

## Security

### S3 Bucket Security

- Bucket is **private** (no public access)
- CloudFront accesses via Origin Access Control (OAC)
- Only CloudFront can read from the bucket

### CloudFront Security

- **HTTPS only**: `redirect-to-https` viewer protocol policy
- **TLS 1.2+**: Modern encryption standards
- **Origin protection**: OAC prevents direct S3 access

### Recommended Enhancements

1. **AWS WAF**: Add Web Application Firewall for DDoS protection
   ```hcl
   resource "aws_wafv2_web_acl" "dashboard" {
     # Rate limiting, geo-blocking, etc.
   }
   ```

2. **CloudFront Functions**: Add authentication layer
   ```javascript
   // Viewer request function for basic auth
   function handler(event) {
     var request = event.request;
     var headers = request.headers;
     // Check authorization header
   }
   ```

3. **Restrict by geography** (if needed):
   ```hcl
   restrictions {
     geo_restriction {
       restriction_type = "whitelist"
       locations        = ["US", "CA", "GB", "DE"]
     }
   }
   ```

- Function URL is public by default
- Add authentication via CloudFront + Lambda@Edge if needed
- Consider AWS WAF for DDoS protection

### Secrets Management

Store GitHub token in SSM Parameter Store:

```bash
aws ssm put-parameter \
  --name /github/actions-dashboard/token \
  --value "ghp_your_token_here" \
  --type SecureString
```

Update `terraform.tfvars`:

```hcl
github_token_parameter_name = "/github/actions-dashboard/token"
```

## Troubleshooting

### Files not updating after deployment

**Cause**: CloudFront cache not invalidated

**Fix**:
```bash
make invalidate
# or
aws cloudfront create-invalidation \
  --distribution-id $(cd infra && terraform output -raw cloudfront_distribution_id) \
  --paths "/*"
```

### 403 Forbidden errors

**Cause**: S3 bucket policy or OAC misconfiguration

**Fix**:
1. Check bucket policy allows CloudFront OAC
2. Verify OAC is attached to distribution
3. Re-apply Terraform: `make infra-apply`

### Website shows old content

**Cause**: Browser or CloudFront cache

**Fix**:
1. Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
2. Invalidate CloudFront: `make invalidate`
3. Check cache-control headers on S3 objects

### Build fails in GitHub Actions

**Cause**: Missing AWS credentials or infrastructure not deployed

**Fix**:
1. Verify GitHub secrets are set:
   ```bash
   gh secret list
   ```
2. Ensure infrastructure is deployed:
   ```bash
   make infra-apply
   ```
3. Check AWS credentials: `aws sts get-caller-identity`

### CloudFront returns 504 Gateway Timeout

**Cause**: S3 bucket deleted or inaccessible

**Fix**:
1. Verify S3 bucket exists:
   ```bash
   aws s3 ls $(cd infra && terraform output -raw s3_bucket_name)
   ```
2. Check bucket has files:
   ```bash
   aws s3 ls s3://$(cd infra && terraform output -raw s3_bucket_name)/ --recursive
   ```
3. Redeploy: `make deploy`
## Cleanup

To destroy all resources:

```bash
cd infra
terraform destroy
```

**Warning**: This will delete:
- S3 bucket and all files
- CloudFront distribution
- OAC configuration

The S3 bucket has versioning enabled, so you may need to empty it first:

```bash
# Empty bucket before destroying
aws s3 rm s3://$(terraform output -raw s3_bucket_name) --recursive

# Then destroy
terraform destroy
```

## Next Steps

- [ ] Set up custom domain with Route 53
- [ ] Add AWS WAF for security
- [ ] Configure CloudWatch alarms
- [ ] Enable access logging
- [ ] Add CloudFront Functions for auth (optional)
- [ ] Set up multi-environment (dev/staging/prod)

## Support

For issues or questions:
- Check S3 bucket contents
- Review CloudFront distribution settings
- Check GitHub Actions logs
- Verify Terraform outputs: `make infra-output`
