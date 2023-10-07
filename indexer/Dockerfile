FROM node:20-bookworm-slim as build-deps
WORKDIR /usr/src/indexer
COPY package.json yarn.lock ./
RUN apt update && apt install -y git curl build-essential
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"
RUN yarn --frozen-lockfile

FROM build-deps as build-app
COPY . .
RUN yarn build

FROM node:20-bookworm-slim as production
RUN apt update && apt install -y dumb-init
ENV NODE_ENV production
USER node
WORKDIR /usr/src/indexer
COPY --chown=node:node --from=build-app /usr/src/indexer /usr/src/indexer
CMD ["dumb-init", "node", "--max-old-space-size=8192", "build/src/index.js"]
