FROM node:20-alpine AS builder

# Metadata
LABEL org.opencontainers.image.title="Actions Dashboard"
LABEL org.opencontainers.image.description="GitHub Actions monitoring dashboard"
LABEL org.opencontainers.image.vendor="stackgobrr"

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source files
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Metadata
LABEL org.opencontainers.image.title="Actions Dashboard"
LABEL org.opencontainers.image.description="GitHub Actions monitoring dashboard"
LABEL org.opencontainers.image.vendor="stackgobrr"

# Copy built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
