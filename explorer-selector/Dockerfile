# Deps
FROM node:18-alpine AS deps

ARG NEXT_PUBLIC_NETWORK_ID
ARG NEXT_PUBLIC_BOS_NETWORK
ARG NEXT_PUBLIC_ACCOUNT_ID

RUN apk add --no-cache libc6-compat git
WORKDIR /usr/src/app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Builder
FROM node:18-alpine AS builder

ARG NEXT_PUBLIC_NETWORK_ID
ARG NEXT_PUBLIC_BOS_NETWORK
ARG NEXT_PUBLIC_ACCOUNT_ID

WORKDIR /usr/src/app
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .
RUN yarn build

# Runner
FROM node:18-alpine AS runner

ARG NEXT_PUBLIC_NETWORK_ID
ARG NEXT_PUBLIC_BOS_NETWORK
ARG NEXT_PUBLIC_ACCOUNT_ID

WORKDIR /usr/src/app

ENV NODE_ENV production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

COPY --from=builder /usr/src/app/next.config.js ./
# COPY --from=builder /usr/src/app/public ./public
COPY --from=builder /usr/src/app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /usr/src/app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /usr/src/app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV HOST 0.0.0.0
ENV PORT 3000
ENV NEXT_TELEMETRY_DISABLED 1

CMD ["node", "server.js"]`
