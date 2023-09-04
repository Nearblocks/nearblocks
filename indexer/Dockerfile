FROM node:16-bullseye-slim as build
WORKDIR /usr/src/indexer
COPY . /usr/src/indexer
RUN apt update && apt install -y git curl build-essential
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"
RUN yarn --frozen-lockfile
RUN yarn build

FROM node:16-bullseye-slim as production
RUN apt update && apt install -y dumb-init
ENV NODE_ENV production
USER node
WORKDIR /usr/src/indexer
COPY --chown=node:node --from=build /usr/src /usr/src
CMD ["dumb-init", "node", "--max-old-space-size=8192", "build/src/index.js"]
