# https://turbo.build/repo/docs/handbook/deploying-with-docker#the-solution
FROM node:22-slim AS base

FROM --platform=$BUILDPLATFORM base AS builder
WORKDIR /app
RUN yarn global add turbo
COPY . .
RUN turbo prune indexer-dex --docker

FROM --platform=$BUILDPLATFORM base AS installer
WORKDIR /app
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/yarn.lock ./yarn.lock
RUN yarn --immutable
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json
RUN yarn turbo run build --filter=indexer-dex...

FROM --platform=$BUILDPLATFORM base AS neon-builder
RUN apt update && apt install -y git curl build-essential
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"
WORKDIR /app
COPY --from=builder /app/out/full/packages/nb-json .
RUN yarn --immutable && yarn build-release

FROM base AS runner
ENV NODE_ENV production
USER node
WORKDIR /app
COPY --chown=node:node --from=installer /app .
COPY --from=neon-builder /app/index.node ./node_modules/nb-json/index.node

CMD ["node", "--max-old-space-size=1536", "apps/indexer-dex/dist/index.js"]
