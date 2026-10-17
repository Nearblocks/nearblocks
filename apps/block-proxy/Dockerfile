FROM node:24-bookworm-slim@sha256:d6aa754f16b3197301076f047b5def2f02ea1dbbc2ca920407d46d7ec7f87b20 AS build
WORKDIR /workspace
RUN corepack enable
COPY . .
RUN pnpm install --frozen-lockfile --filter block-proxy...
RUN pnpm --filter nb-logger build && pnpm --filter block-proxy build
RUN pnpm --filter block-proxy deploy --prod /deploy

FROM node:24-bookworm-slim@sha256:d6aa754f16b3197301076f047b5def2f02ea1dbbc2ca920407d46d7ec7f87b20
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build --chown=node:node /deploy/package.json ./package.json
COPY --from=build --chown=node:node /deploy/dist ./dist
COPY --from=build --chown=node:node /deploy/node_modules ./node_modules
LABEL org.opencontainers.image.title="NearBlocks block proxy"
USER node
CMD ["node", "dist/index.js"]
