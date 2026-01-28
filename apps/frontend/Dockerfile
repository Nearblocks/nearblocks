FROM node:24-alpine AS base 
RUN apk update
RUN apk add --no-cache libc6-compat

WORKDIR /app

FROM base AS prepare
RUN yarn global add turbo
COPY . .
RUN turbo prune frontend --docker

FROM base AS builder
COPY --from=prepare /app/out/json/ .
RUN yarn install
COPY --from=prepare /app/out/full/ .
RUN yarn turbo build

FROM base AS runner
WORKDIR /app

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NODE_ENV=production

COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/.next/static ./apps/frontend/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/public ./apps/frontend/public

CMD ["node", "apps/frontend/server.js"]
