FROM node:20-alpine
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV CI=true
ENV HUSKY=0
ENV PORT=3003

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build
EXPOSE 3003
CMD ["pnpm", "start", "--", "-H", "0.0.0.0", "-p", "3003"]
