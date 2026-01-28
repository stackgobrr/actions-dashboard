# Actions Dashboard - AWS Infrastructure

This directory contains Terraform configuration to deploy the Actions Dashboard with:
1. Static frontend (S3 + CloudFront)
2. Real-time webhook infrastructure (Lambda Function URLs + SSE)

## Architecture

```
┌──────────────┐
│    GitHub    │
│  Workflows   │
└───┬──────────┘
    │ Webhook Events
    ▼
┌──────────────┐     ┌──────────────┐
│   Lambda     │────▶│   Lambda     │
│   Webhook    │     │ SSE Handler  │
│   Receiver   │     │ (Streaming)  │
└──────────────┘     └───────┬──────┘
                             │ Server-Sent Events
                             ▼
┌──────────────┐     ┌──────────────┐
│      S3      │────▶│  CloudFront  │
│    Bucket    │     │ Distribution │
└──────────────┘     └───────┬──────┘
                             │
                             ▼
                       React Dashboard
```

## Features

### Frontend Infrastructure
- **S3 Static Hosting**: Secure, scalable static file storage
- **CloudFront CDN**: Global edge caching for fast delivery
- **Origin Access Control (OAC)**: Secure S3 access without public bucket
- **HTTPS by Default**: Secure connections via CloudFront
- **SPA Routing**: Custom error responses for React Router
- **Cache Optimization**: Long-lived caching for assets, no-cache for HTML
- **Auto-deploy**: GitHub Actions deploys on every push to main
- **Custom Domain Support**: Optional Route 53 + ACM integration

### Real-Time Webhook Infrastructure
- **Lambda Webhook Receiver**: Receives and validates GitHub webhook events
- **Lambda SSE Handler**: Streams workflow updates to browser clients via Server-Sent Events
- **Multi-Tenant Security**: Installation ID filtering ensures users only see their repos
- **Lambda Function URLs**: Simple HTTPS endpoints without API Gateway complexity
- **Response Streaming**: Sub-second latency for workflow status updates

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
- Lambda functions for OAuth callbacks
- IAM roles and CloudWatch log groups

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
| `hosted_zone_id` | Route53 hosted zone ID (required if domain_name set) | `""` |

### CloudFront Price Classes

- **PriceClass_All**: All edge locations worldwide (most expensive)
- **PriceClass_200**: US, Canada, Europe, Asia, Middle East, Africa
- **PriceClass_100**: US, Canada, Europe only (cheapest)

For a dashboard accessed mainly from EU/US, `PriceClass_100` is sufficient.

### Cache Configuration

The deployment uses optimised caching:
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

## Cost Optimisation

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

## Custom Domain Setup

The infrastructure now supports automatic custom domain setup with ACM certificate and Route53 DNS.

### Prerequisites

1. **Route53 Hosted Zone**: Domain registered in Route53 or hosted zone created
2. **Hosted Zone ID**: Get from Route53 console or AWS CLI

### Configuration Steps

1. **Update terraform.tfvars**:
   ```hcl
   domain_name    = "actions.dashboard.h3ow3d.com"
   hosted_zone_id = "Z07170922H7CK1PCDM6NG"
   ```

2. **Apply Terraform**:
   ```bash
   cd infra
   terraform apply
   ```

This will automatically:
- Create ACM certificate in us-east-1 (required for CloudFront)
- Add DNS validation records to Route53
- Wait for certificate validation
- Update CloudFront distribution with custom domain and SSL certificate
- Create Route53 A record (alias) pointing to CloudFront

3. **Wait for propagation** (usually 5-15 minutes for DNS, up to 20 minutes for certificate validation)

4. **Access your dashboard**:
   ```bash
   terraform output website_url
   # https://actions.dashboard.h3ow3d.com
   ```

### What Gets Created

- **ACM Certificate** (us-east-1): Free SSL/TLS certificate for your domain
- **DNS Validation Records**: Automatically added to Route53 for certificate validation
- **CloudFront Alias**: Custom domain added to CloudFront distribution
- **Route53 A Record**: Points your domain to CloudFront using alias record

### Troubleshooting

If the domain doesn't work immediately:
1. Check certificate status: `aws acm describe-certificate --certificate-arn <arn> --region us-east-1`
2. Verify DNS propagation: `dig actions.dashboard.h3ow3d.com`
3. Check CloudFront status: Distribution must be "Deployed" (not "In Progress")

### Costs

- **Route53**: $0.50/hosted zone/month + $0.40 per million queries
- **ACM Certificate**: **FREE**
- **CloudFront custom domain**: No additional cost

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
