FROM node:22-alpine as base

# Builder stage
FROM --platform=$BUILDPLATFORM base AS builder
WORKDIR /app

# Set up pnpm and install turbo
ENV SHELL=/bin/sh
RUN corepack enable && corepack prepare pnpm@latest --activate
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="${PNPM_HOME}:$PATH"
RUN pnpm setup && \
    pnpm install turbo --global

COPY . .
RUN turbo prune app --docker

# Installer stage
FROM --platform=$BUILDPLATFORM base AS installer
RUN apk add --no-cache git
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED 1

# Set up pnpm
ENV SHELL=/bin/sh
RUN corepack enable && corepack prepare pnpm@latest --activate
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="${PNPM_HOME}:$PATH"
RUN pnpm setup

# Copy package.json and pnpm-lock.yaml
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code and build
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json
RUN pnpm turbo run build --filter=app...

# Runner stage
FROM base AS runner
WORKDIR /app

# Set production environment
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy the built application
COPY --from=installer --chown=nextjs:nodejs /app/apps/app/package.json ./package.json
COPY --from=installer --chown=nextjs:nodejs /app/apps/app/.next ./.next
COPY --from=installer --chown=nextjs:nodejs /app/apps/app/public ./public
COPY --from=installer --chown=nextjs:nodejs /app/apps/app/node_modules ./node_modules

USER nextjs

# Expose port
EXPOSE 3000

# Start the application using Next.js start command
CMD ["pnpm", "start"]