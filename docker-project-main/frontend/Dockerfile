FROM node:22-alpine AS builder

WORKDIR /app

# Set environment for build
ENV NODE_ENV=production \
    NODE_OPTIONS=--max-old-space-size=2048

# Set npm configurations for stable builds
RUN npm config set fetch-timeout 300000 && \
    npm config set fetch-retry-mintimeout 10000 && \
    npm config set fetch-retry-maxtimeout 300000 && \
    npm config set registry https://registry.npmjs.org/ && \
    npm config set legacy-peer-deps true

# Copy package files
COPY package*.json ./

# Install dependencies with explicit flags
RUN npm ci --prefer-offline --no-audit --no-fund --verbose || \
    (node -v && npm -v && npm ci)

# Copy source code
COPY . .

# Build application with verbose output
RUN echo "Starting Vite build..." && \
    npm run build && \
    echo "Vite build completed successfully!" && \
    ls -la dist/

FROM nginx:stable-alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Verify build artifacts
RUN ls -la /usr/share/nginx/html/ && \
    echo "Build artifacts copied successfully!"

EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]