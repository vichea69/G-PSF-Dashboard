FROM node:20-alpine AS base

# Install necessary dependencies and corepack
RUN apk add --no-cache libc6-compat sqlite

# Install pnpm v10 explicitly using npm
RUN npm install -g pnpm@10

# Verify pnpm installation
RUN pnpm -v

# Dependencies stage
FROM base AS deps
WORKDIR /app

# Copy package and lock files
COPY package.json pnpm-lock.yaml .npmrc* ./

# Install pnpm dependencies with frozen-lockfile
RUN pnpm install --frozen-lockfile

# Build stage
FROM base AS builder
WORKDIR /app

# Disable telemetry and build the app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm run build

# Runner stage for production
FROM base AS runner
WORKDIR /app

# Environment variables for production
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3003
ENV HOSTNAME=0.0.0.0

# Set up user and group for running the app
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built files from builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Set user to 'nextjs' for security
USER nextjs

# Expose port 3003 for the app
EXPOSE 3003

# Start the Node.js app
CMD ["node", "server.js"]