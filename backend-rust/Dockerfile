# Stage 1: Build
FROM rust:alpine AS builder

# Install build dependencies for compile stage
RUN apk add --no-cache musl-dev

WORKDIR /app

# Copy configuration and source files
COPY Cargo.toml Cargo.lock ./
COPY src ./src

# Compile release binaries
RUN cargo build --release --bin backend-rust
RUN cargo build --release --bin seed

# Stage 2: Runtime image
FROM alpine:3.20

# Install runtime dependencies (CA certificates for secure networking)
RUN apk add --no-cache ca-certificates

WORKDIR /app

# Copy the compiled binaries from the builder stage
COPY --from=builder /app/target/release/backend-rust /app/backend-rust
COPY --from=builder /app/target/release/seed /app/seed

EXPOSE 3001

# Start the main server
CMD ["/app/backend-rust"]
