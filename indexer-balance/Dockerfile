FROM node:20-bookworm-slim as build
RUN apt-get update && apt-get install -y --no-install-recommends dumb-init
WORKDIR /usr/src/indexer
COPY package.json yarn.lock ./
RUN yarn --immutable
COPY . .
RUN yarn build

FROM node:20-bookworm-slim as production
COPY --from=build /usr/bin/dumb-init /usr/bin/dumb-init
ENV NODE_ENV production
USER node
WORKDIR /usr/src/indexer
COPY --chown=node:node --from=build /usr/src/indexer/build ./build
COPY --chown=node:node --from=build /usr/src/indexer/package.json ./package.json
COPY --chown=node:node --from=build /usr/src/indexer/node_modules ./node_modules
CMD ["dumb-init", "node", "build/src/index.js"]
