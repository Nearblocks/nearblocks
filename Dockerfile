ARG BASE=node:24-bookworm-slim
ARG NEON=false

FROM ${BASE} AS base

FROM base AS pruner
ARG APP
WORKDIR /app
RUN npm install -g turbo@2.11.6
COPY . .
RUN turbo prune ${APP} --docker

FROM base AS installer
ARG APP
WORKDIR /app
COPY .gitignore .gitignore
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
RUN npm install -g pnpm@12.8.1
RUN pnpm install --frozen-lockfile
COPY --from=pruner /app/out/full/ .
COPY turbo.json turbo.json
RUN pnpm turbo run build --filter=${APP}...

FROM base AS neon-false
RUN mkdir -p /out

FROM base AS neon-true
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates git curl build-essential
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"
WORKDIR /app
COPY packages/nb-json .
RUN npm install && npm run build-release
RUN mkdir -p /out && cp index.node /out/index.node

FROM neon-${NEON} AS neon

FROM base AS runner
ARG APP
ARG APT_PACKAGES="ca-certificates"
ARG NODE_ARGS=""
RUN apt-get update && apt-get install -y --no-install-recommends ${APT_PACKAGES} && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production
ENV APP=${APP}
ENV NODE_ARGS=${NODE_ARGS}
USER node
WORKDIR /app
COPY --chown=node:node --from=installer /app .
COPY --from=neon /out/ ./packages/nb-json/

CMD ["sh", "-c", "exec node ${NODE_ARGS} apps/${APP}/dist/index.js"]
