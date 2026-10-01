FROM node:24-alpine AS base

FROM --platform=$BUILDPLATFORM base AS builder
WORKDIR /app
RUN npm install -g turbo@2.11.6
COPY . .
RUN turbo prune app-lite --docker

FROM --platform=$BUILDPLATFORM base AS installer
RUN apk add git
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /app/apps/bos-lite/src/widget ./apps/bos-lite/src/widget
RUN npm install -g pnpm@12.8.1
RUN pnpm install --frozen-lockfile
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json
RUN pnpm turbo run build --filter=app-lite...

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs
COPY --from=installer /app/apps/app-lite/next.config.mjs .
COPY --from=installer /app/apps/app-lite/package.json .
COPY --from=installer --chown=nextjs:nodejs /app/apps/app-lite/public ./apps/app-lite/public
COPY --from=installer --chown=nextjs:nodejs /app/apps/app-lite/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/app-lite/.next/static ./apps/app-lite/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/app-lite/generate-env.js ./apps/app-lite/generate-env.js
COPY --from=builder --chown=nextjs:nodejs /app/apps/app-lite/entrypoint.sh ./apps/app-lite/entrypoint.sh
RUN chmod +x /app/apps/app-lite/entrypoint.sh

CMD ["apps/app-lite/entrypoint.sh"]
