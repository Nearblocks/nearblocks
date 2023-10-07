FROM node:20-bookworm-slim as build
WORKDIR /usr/src/api
COPY . /usr/src/api
RUN yarn --frozen-lockfile
RUN yarn build

FROM node:20-bookworm-slim as production
RUN apt update && apt install -y dumb-init
ENV PORT 3001
ENV NODE_ENV production
USER node
WORKDIR /usr/src/api
EXPOSE 3001
COPY --chown=node:node --from=build /usr/src /usr/src
CMD ["dumb-init", "node", "build/src/index.js"]
