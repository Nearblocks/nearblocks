# https://turbo.build/repo/docs/handbook/deploying-with-docker#the-solution
FROM node:22-alpine AS base

FROM --platform=$BUILDPLATFORM base AS builder
WORKDIR /app
RUN yarn global add turbo
COPY . .
RUN turbo prune api --docker

FROM --platform=$BUILDPLATFORM base AS installer
WORKDIR /app
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/yarn.lock ./yarn.lock
RUN apk add --no-cache git
RUN yarn --immutable
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json
RUN yarn turbo run build --filter=api...

FROM base AS runner
ENV NODE_ENV production
USER node
WORKDIR /app
COPY --chown=node:node --from=installer /app .

CMD ["node", "apps/api/dist/index.js"]
