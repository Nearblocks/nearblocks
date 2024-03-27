FROM node:20-alpine as base

FROM --platform=$BUILDPLATFORM base AS builder
WORKDIR /app
RUN yarn global add turbo
COPY . .
RUN turbo prune app --docker

FROM --platform=$BUILDPLATFORM base AS installer
RUN apk add git
WORKDIR /app
ARG NEXT_PUBLIC_NETWORK_ID
ARG NEXT_PUBLIC_BOS_NETWORK
ARG NEXT_PUBLIC_ACCOUNT_ID
ARG NEXT_PUBLIC_OG_URL
ARG NEXT_PUBLIC_MAINNET_URL
ARG NEXT_PUBLIC_TESTNET_URL
ENV NEXT_TELEMETRY_DISABLED 1
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/yarn.lock ./yarn.lock
RUN yarn --immutable
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json
RUN yarn turbo run build --filter=app...

FROM base AS runner
WORKDIR /app
ARG NEXT_PUBLIC_NETWORK_ID
ARG NEXT_PUBLIC_BOS_NETWORK
ARG NEXT_PUBLIC_ACCOUNT_ID
ARG NEXT_PUBLIC_OG_URL
ARG NEXT_PUBLIC_MAINNET_URL
ARG NEXT_PUBLIC_TESTNET_URL
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs
COPY --from=installer /app/apps/app/next.config.js .
COPY --from=installer /app/apps/app/package.json .
COPY --from=installer --chown=nextjs:nodejs /app/apps/app/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/app/.next/static ./apps/app/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/app/public ./apps/app/public
CMD ["node", "apps/app/server.js"]
