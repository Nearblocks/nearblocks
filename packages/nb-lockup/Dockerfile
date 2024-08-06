
FROM node:20-bookworm-slim
RUN apt update && apt install -y git curl build-essential pkg-config libssl-dev dumb-init
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"
WORKDIR /usr/src/app
COPY . .
RUN yarn --immutable && yarn build-release
CMD []
