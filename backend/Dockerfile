# ─── Stage 1: install dependencies ──────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

# Copy manifests only — layer is cached until package.json changes
COPY package*.json ./

# Install ALL deps (including devDeps needed for any build steps)
RUN npm ci --ignore-scripts

# ─── Stage 2: production image ───────────────────────────────────────────────
FROM node:20-alpine AS production

# Install dumb-init: a tiny init process that correctly forwards signals
# (SIGTERM) from Docker to Node, enabling graceful shutdown
RUN apk add --no-cache dumb-init

WORKDIR /app

# Copy only production node_modules from the deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source
COPY . .

# Remove any local .env so container env vars always win
RUN rm -f .env

# Create a non-root user and switch to it — never run Node as root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 5000

# dumb-init as PID 1 so SIGTERM is properly forwarded to Node
CMD ["dumb-init", "node", "server.js"]
