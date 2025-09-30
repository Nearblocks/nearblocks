FROM node:22-alpine AS base

FROM --platform=$BUILDPLATFORM base AS builder
WORKDIR /app
RUN yarn global add turbo
COPY . .
RUN turbo prune app --docker

FROM --platform=$BUILDPLATFORM base AS installer
RUN apk add --no-cache git python3 py3-pip make g++
WORKDIR /app
ARG GITHUB_SHA
ARG NEXT_SERVER_ACTIONS_ENCRYPTION_KEY
ENV GITHUB_SHA=$GITHUB_SHA
ENV NEXT_SERVER_ACTIONS_ENCRYPTION_KEY=$NEXT_SERVER_ACTIONS_ENCRYPTION_KEY
ENV NEXT_TELEMETRY_DISABLED 1
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/yarn.lock ./yarn.lock
RUN yarn --immutable
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json
RUN yarn turbo run build --filter=app...

FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ARG NEXT_SERVER_ACTIONS_ENCRYPTION_KEY
ENV NEXT_SERVER_ACTIONS_ENCRYPTION_KEY=$NEXT_SERVER_ACTIONS_ENCRYPTION_KEY
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs
COPY --from=installer /app/apps/app/next.config.mjs .
COPY --from=installer /app/apps/app/package.json .
COPY --from=installer --chown=nextjs:nodejs /app/apps/app/public ./apps/app/public
COPY --from=installer --chown=nextjs:nodejs /app/apps/app/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/app/.next/static ./apps/app/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/app/generate-env.js ./apps/app/generate-env.js
COPY --from=builder --chown=nextjs:nodejs /app/apps/app/entrypoint.sh ./apps/app/entrypoint.sh

RUN chmod +x /app/apps/app/entrypoint.sh
CMD ["apps/app/entrypoint.sh"]
