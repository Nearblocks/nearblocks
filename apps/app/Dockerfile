# Use Node 20 LTS
FROM node:20-alpine as base

# Builder stage
FROM --platform=$BUILDPLATFORM base AS builder
WORKDIR /app
RUN yarn global add turbo
COPY . .
RUN turbo prune app --docker

# Installer stage
FROM --platform=$BUILDPLATFORM base AS installer
RUN apk add --no-cache git
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED 1

# Copy package.json and yarn.lock
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/yarn.lock ./yarn.lock

# Install dependencies
RUN yarn install --immutable

# Copy source code and build
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json
RUN yarn turbo run build --filter=app...

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
CMD ["yarn", "start"]
