FROM node:20-alpine as base

# Builder stage
FROM --platform=$BUILDPLATFORM base AS builder
WORKDIR /app

# Set up pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate
ENV PNPM_HOME=/app/.pnpm
ENV PATH=$PNPM_HOME:$PATH

# Copy root files first
COPY pnpm-lock.yaml package.json turbo.json ./
COPY apps/app/package.json ./apps/app/package.json

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Build the application
RUN pnpm --filter app run build

# Runner stage
FROM base AS runner
WORKDIR /app

# Set production environment
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Set up pnpm for production
RUN corepack enable && corepack prepare pnpm@latest --activate
ENV PNPM_HOME=/app/.pnpm
ENV PATH=$PNPM_HOME:$PATH

# Copy necessary files
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/apps/app/package.json ./apps/app/package.json
COPY --from=builder /app/apps/app/.next ./apps/app/.next
COPY --from=builder /app/apps/app/public ./apps/app/public

# Install production dependencies
RUN pnpm install --frozen-lockfile --prod

USER nextjs
WORKDIR /app/apps/app

EXPOSE 3000

CMD ["pnpm", "start"]