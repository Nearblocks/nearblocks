# https://turbo.build/repo/docs/handbook/deploying-with-docker#the-solution
FROM node:20-bookworm-slim as base

FROM base AS builder
RUN apt update && apt install -y dumb-init
WORKDIR /app
RUN yarn global add turbo
COPY . .
RUN turbo prune app --docker

FROM base AS installer
WORKDIR /app
ARG NEXT_PUBLIC_NETWORK_ID
ARG NEXT_PUBLIC_BOS_NETWORK
ARG NEXT_PUBLIC_ACCOUNT_ID
ENV NEXT_TELEMETRY_DISABLED 1
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/yarn.lock ./yarn.lock
RUN yarn install
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json
RUN yarn turbo run build --filter=app...

FROM base AS runner
WORKDIR /app
ARG NEXT_PUBLIC_NETWORK_ID
ARG NEXT_PUBLIC_BOS_NETWORK
ARG NEXT_PUBLIC_ACCOUNT_ID
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs
COPY --from=builder /usr/bin/dumb-init /usr/bin/dumb-init
COPY --from=installer /app/apps/web/next.config.js .
COPY --from=installer /app/apps/web/package.json .
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

CMD ["dumb-init", "node", "apps/app/dist/index.js"]
