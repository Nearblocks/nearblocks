FROM rust:1-bookworm AS chef
RUN cargo install cargo-chef@0.1.73
WORKDIR /app

FROM chef AS planner
COPY apps/block-proxy/ .
RUN cargo chef prepare --recipe-path recipe.json

FROM chef AS builder
COPY --from=planner /app/recipe.json recipe.json
RUN cargo chef cook --release --recipe-path recipe.json
COPY apps/block-proxy/ .
RUN cargo build --release --bin block-proxy

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates curl && rm -rf /var/lib/apt/lists/*
RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 --ingroup appgroup appuser
COPY --from=builder /app/target/release/block-proxy /usr/local/bin/block-proxy
USER appuser
EXPOSE 3000
EXPOSE 3001
CMD ["/usr/local/bin/block-proxy"]
