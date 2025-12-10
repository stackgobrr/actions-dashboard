.PHONY: help install dev build preview docker-build docker-run docker-stop clean

# Default target
.DEFAULT_GOAL := help

# Variables
IMAGE_NAME := h3ow3d-actions-dashboard
CONTAINER_NAME := h3ow3d-dashboard
PORT := 8080

help: ## Show this help message
	@echo "h3ow3d Actions Dashboard - Available commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies
	npm install

dev: ## Run development server (npm)
	npm run dev

build: ## Build for production
	npm run build

preview: ## Preview production build locally
	npm run preview

docker-build: ## Build Docker image
	docker build -t $(IMAGE_NAME) .

docker-run: ## Run Docker container
	@echo "Starting dashboard on http://localhost:$(PORT)"
	docker run -d \
		--name $(CONTAINER_NAME) \
		-p $(PORT):80 \
		--restart unless-stopped \
		$(IMAGE_NAME)
	@echo "Dashboard running at http://localhost:$(PORT)"

docker-stop: ## Stop and remove Docker container
	docker stop $(CONTAINER_NAME) 2>/dev/null || true
	docker rm $(CONTAINER_NAME) 2>/dev/null || true

docker-logs: ## View Docker container logs
	docker logs -f $(CONTAINER_NAME)

docker-restart: docker-stop docker-run ## Restart Docker container

docker-rebuild: docker-stop docker-build docker-run ## Rebuild and restart Docker container

docker-shell: ## Open shell in running container
	docker exec -it $(CONTAINER_NAME) sh

clean: ## Clean build artifacts and node_modules
	rm -rf dist node_modules

lint: ## Run linter
	npm run lint

# Quick shortcuts
up: docker-rebuild ## Quick rebuild and run (alias)
down: docker-stop ## Quick stop (alias)
logs: docker-logs ## Quick logs (alias)

# AWS S3/CloudFront deployment commands
.PHONY: infra-init infra-plan infra-apply infra-destroy infra-output deploy sync invalidate aws-deploy

AWS_REGION := eu-west-2
S3_BUCKET := $(shell cd infra && terraform output -raw s3_bucket_name 2>/dev/null)
DISTRIBUTION_ID := $(shell cd infra && terraform output -raw cloudfront_distribution_id 2>/dev/null)

infra-init: ## Initialize Terraform
	cd infra && terraform init

infra-plan: ## Plan Terraform changes
	cd infra && terraform plan

infra-apply: ## Apply Terraform changes
	cd infra && terraform apply

infra-destroy: ## Destroy Terraform infrastructure
	cd infra && terraform destroy

infra-output: ## Show Terraform outputs
	cd infra && terraform output

sync: build ## Sync built files to S3
	@echo "Syncing files to S3..."
	@aws s3 sync dist/ s3://$(S3_BUCKET)/ \
		--delete \
		--cache-control "public, max-age=31536000, immutable" \
		--exclude "index.html" \
		--exclude "*.map"
	@echo "Uploading index.html with no-cache..."
	@aws s3 cp dist/index.html s3://$(S3_BUCKET)/index.html \
		--cache-control "public, max-age=0, must-revalidate"
	@echo "✓ Files synced to S3"

invalidate: ## Invalidate CloudFront cache
	@echo "Invalidating CloudFront cache..."
	@aws cloudfront create-invalidation \
		--distribution-id $(DISTRIBUTION_ID) \
		--paths "/*" \
		--query 'Invalidation.Id' \
		--output text
	@echo "✓ Cache invalidation started"

deploy: sync invalidate ## Build, sync to S3, and invalidate CloudFront (full deploy)
	@echo "✓ Deployment complete!"
	@echo "Website URL:"
	@cd infra && terraform output -raw website_url

aws-deploy: deploy ## Alias for deploy
