# ─── Stage 1: build the React app ────────────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

# Copy manifests first for layer caching
COPY package*.json ./
RUN npm ci --ignore-scripts

COPY . .

# VITE_API_URL is baked into the JS bundle at build time.
# In dev docker-compose we pass /api (relative) so nginx proxies it.
# In production you can override with your real domain.
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ─── Stage 2: serve with nginx ────────────────────────────────────────────────
FROM nginx:1.27-alpine AS production

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy our custom nginx config (handles SPA routing + /api proxy)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built static files from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# nginx runs as non-root by default in the official image on port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
