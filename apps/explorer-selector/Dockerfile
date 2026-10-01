# https://turbo.build/repo/docs/handbook/deploying-with-docker#the-solution
FROM node:24-alpine AS base

FROM --platform=$BUILDPLATFORM base AS builder
WORKDIR /app
RUN npm install -g turbo@2.11.6
COPY . .
RUN turbo prune explorer-selector --docker

FROM --platform=$BUILDPLATFORM base AS installer
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
RUN npm install -g pnpm@12.8.1
RUN pnpm install --frozen-lockfile
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json
RUN pnpm turbo run build --filter=explorer-selector...

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs
COPY --from=installer /app/apps/explorer-selector/next.config.js .
COPY --from=installer /app/apps/explorer-selector/package.json .
COPY --from=installer --chown=nextjs:nodejs /app/apps/explorer-selector/public ./apps/explorer-selector/public
COPY --from=installer --chown=nextjs:nodejs /app/apps/explorer-selector/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/explorer-selector/.next/static ./apps/explorer-selector/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/explorer-selector/generate-env.js ./apps/explorer-selector/generate-env.js
COPY --from=builder --chown=nextjs:nodejs /app/apps/explorer-selector/entrypoint.sh ./apps/explorer-selector/entrypoint.sh

RUN chmod +x /app/apps/explorer-selector/entrypoint.sh
CMD ["apps/explorer-selector/entrypoint.sh"]