FROM node:20-alpine as base

FROM --platform=$BUILDPLATFORM base AS builder
WORKDIR /app
RUN yarn global add turbo
COPY . .
RUN turbo prune contract-verifier --docker

FROM --platform=$BUILDPLATFORM base AS installer
WORKDIR /app
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/yarn.lock ./yarn.lock
RUN yarn --immutable
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json
RUN yarn turbo run build --filter=contract-verifier...

FROM nearprotocol/contract-builder:latest AS runner
ENV NODE_ENV production
WORKDIR /app
COPY --from=installer /app .
RUN apt-get update && \
    apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

ENTRYPOINT ["node", "apps/contract-verifier/dist/index.js"]
