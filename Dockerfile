# Build & run environment for the anoweb backend.
# Single stage on purpose: one image that can both compile and run the app.
FROM golang:1.25

WORKDIR /app

# Download dependencies first so they are cached across rebuilds.
COPY go.mod go.sum ./
RUN go mod download

# Copy the source and compile.
COPY . .
RUN go build -o /app/anoweb ./cmd/anoweb

# The app reads PORT from .env; production uses 8080.
# Note: docker-compose runs this container with host networking, so the
# app listens on the host's 127.0.0.1:8080 directly (same as before Docker).
EXPOSE 8080

# .env is NOT baked into the image (see .dockerignore); docker-compose
# bind-mounts the runtime .env to /app/.env, where godotenv picks it up.
CMD ["/app/anoweb"]
