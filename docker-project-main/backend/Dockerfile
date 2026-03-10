# Build stage
FROM node:22-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with proper timeouts
RUN npm config set fetch-timeout 120000 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm install --legacy-peer-deps --only=production

# Final stage
FROM node:22-alpine

WORKDIR /app

# Copy from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy application files
COPY package*.json ./
COPY index.js ./
COPY food.js ./
COPY user.js ./

# Set environment variables
ENV NODE_ENV=production

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})" || exit 1

# Start the app
CMD ["node", "index.js"]