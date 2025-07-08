# Dockerfile for Bull Queue Workers
# Created: 03-Jul-25
# This Dockerfile is used for background job processing workers

FROM node:20-alpine AS base

# Install pnpm
RUN corepack enable
RUN corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./

# Copy service-specific files
COPY services/workers/package.json ./services/workers/

# Install dependencies
RUN pnpm install --frozen-lockfile --prod

# Build stage
FROM base AS builder

# Install all dependencies (including dev)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY services/workers ./services/workers
COPY packages ./packages
COPY tsconfig.json ./

# Build the workers
RUN pnpm --filter workers build

# Production stage
FROM node:20-alpine AS production

# Install pnpm
RUN corepack enable
RUN corepack prepare pnpm@latest --activate

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/services/workers/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/services/workers/package.json ./

# Set environment
ENV NODE_ENV=production

# Switch to non-root user
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node dist/health.js || exit 1

# Start the worker
CMD ["node", "dist/index.js"]