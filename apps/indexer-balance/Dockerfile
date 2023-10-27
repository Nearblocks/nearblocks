# https://turbo.build/repo/docs/handbook/deploying-with-docker#the-solution
FROM node:20-bookworm-slim as base

FROM base AS builder
RUN apt update && apt install -y dumb-init
WORKDIR /app
RUN yarn global add turbo
COPY . .
RUN turbo prune indexer-balance --docker

FROM base AS installer
WORKDIR /app

COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/yarn.lock ./yarn.lock
RUN yarn --immutable

COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json
RUN yarn turbo run build --filter=indexer-balance...

FROM base AS runner
ENV NODE_ENV production
USER node
WORKDIR /app

COPY --chown=node:node --from=installer /app .
COPY --from=builder /usr/bin/dumb-init /usr/bin/dumb-init

CMD ["dumb-init", "node", "apps/indexer-balance/dist/index.js"]
