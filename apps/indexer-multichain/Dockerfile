# https://turbo.build/repo/docs/handbook/deploying-with-docker#the-solution
FROM node:20-bookworm-slim AS base

FROM --platform=$BUILDPLATFORM base AS builder
WORKDIR /app
RUN yarn global add turbo
COPY . .
RUN turbo prune indexer-multichain --docker

FROM --platform=$BUILDPLATFORM base AS installer
WORKDIR /app
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/yarn.lock ./yarn.lock
RUN yarn --immutable
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json
RUN yarn turbo run build --filter=indexer-multichain...

FROM base AS runner
ENV NODE_ENV production
USER node
WORKDIR /app
COPY --chown=node:node --from=installer /app .

CMD ["node", "--max-old-space-size=2048", "apps/indexer-multichain/dist/index.js"]
