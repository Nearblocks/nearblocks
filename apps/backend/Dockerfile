# https://turbo.build/repo/docs/handbook/deploying-with-docker#the-solution
FROM node:20-bookworm-slim as base

FROM --platform=$BUILDPLATFORM base AS builder
WORKDIR /app
RUN yarn global add turbo
COPY . .
RUN turbo prune backend --docker

FROM --platform=$BUILDPLATFORM base AS installer
WORKDIR /app
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/yarn.lock ./yarn.lock
RUN yarn --immutable
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json
RUN yarn turbo run build --filter=backend...

FROM base AS runner
RUN apt update && apt install -y libssl-dev ca-certificates
ENV NODE_ENV production
USER node
WORKDIR /app
COPY --chown=node:node --from=installer /app .

CMD ["node", "apps/backend/dist/index.js"]
