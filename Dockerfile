# ======================
# 1️⃣ Base image
# ======================
FROM node:22-alpine AS base
WORKDIR /app

# Enable pnpm
RUN corepack enable

# ======================
# 2️⃣ Dependencies
# ======================
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ======================
# 3️⃣ Build
# ======================
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# ======================
# 4️⃣ Production runner
# ======================
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN corepack enable

COPY --from=build /app/package.json ./
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/node_modules ./node_modules

EXPOSE 3003

CMD ["pnpm", "start", "--", "-H", "0.0.0.0", "-p", "3003"]
