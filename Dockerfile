# Build stage
FROM golang:1.25.5-alpine AS builder

WORKDIR /app

# Install dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/bin/api ./cmd/api

# Final stage
FROM alpine:3.21

WORKDIR /app

# Install ca-certificates for external HTTP requests (Firebase, etc)
RUN apk --no-cache add ca-certificates tzdata

# Copy binary from builder
COPY --from=builder /app/bin/api ./api
COPY --from=builder /app/.firebase ./.firebase
COPY --from=builder /app/migrations ./migrations

# Expose port
EXPOSE 2077

# Set entry point
CMD ["./api"]
