FROM node:22-alpine AS base

FROM --platform=$BUILDPLATFORM base AS builder
WORKDIR /app
RUN yarn global add turbo
COPY . .
RUN turbo prune block-proxy --docker

FROM --platform=$BUILDPLATFORM base AS installer
WORKDIR /app
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/yarn.lock ./yarn.lock
RUN yarn --immutable
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json
RUN yarn turbo run build --filter=block-proxy...

FROM base AS runner
ENV NODE_ENV production
USER node
WORKDIR /app
COPY --chown=node:node --from=installer /app .
EXPOSE 3000 3001
CMD ["node", "apps/block-proxy/dist/index.js"]
