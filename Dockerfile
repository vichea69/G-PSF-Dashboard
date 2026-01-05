FROM node:20-alpine AS deps
WORKDIR /app

# Enable pnpm
RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ======================
# 2️⃣ Builder
# ======================
FROM node:20-alpine AS builder
WORKDIR /app

RUN corepack enable
ENV NEXT_TELEMETRY_DISABLED=1
ENV CI=true
ENV HUSKY=0

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN pnpm build

# ======================
# 3️⃣ Runner (production)
# ======================
FROM node:20-alpine AS runner
WORKDIR /app

RUN corepack enable

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV CI=true
ENV HUSKY=0
ENV PORT=3003

COPY package.json pnpm-lock.yaml ./

# Install prod deps only
RUN pnpm install --prod --frozen-lockfile \
  && pnpm store prune

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/next.config.ts ./next.config.ts

EXPOSE 3003

CMD ["pnpm", "start", "--", "-H", "0.0.0.0", "-p", "3003"]
