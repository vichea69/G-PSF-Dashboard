# syntax=docker/dockerfile:1
FROM node:22-bookworm-slim AS base
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
ENV CI=true

RUN corepack enable

# ======================
# Dependencies
# ======================
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ======================
# Builder
# ======================
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN pnpm build
RUN pnpm prune --prod

# ======================
# Runner
# ======================
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3003

COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next ./.next
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/package.json ./package.json
COPY --from=builder --chown=node:node /app/next.config.ts ./next.config.ts

USER node

EXPOSE 3003
CMD ["node", "node_modules/next/dist/bin/next", "start", "--port", "3003", "--hostname", "0.0.0.0"]
