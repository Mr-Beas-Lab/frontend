# syntax=docker/dockerfile:1.4

# Stage 1: Builder
FROM node:20-alpine as builder

WORKDIR /app

# Install dependencies including devDependencies
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# Copy source files
COPY . .

# Build the application
RUN --mount=type=cache,target=/app/node_modules/.cache \
    npm run build

# Stage 2: Production
FROM nginx:alpine

# Create necessary directories with correct permissions
RUN mkdir -p /var/cache/nginx/client_temp && \
    mkdir -p /run && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /run && \
    chmod -R 755 /var/cache/nginx && \
    chmod -R 755 /run

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Set permissions for nginx files
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx && \
    chmod -R 755 /usr/share/nginx/html && \
    chmod -R 755 /var/log/nginx && \
    chmod -R 755 /etc/nginx

# Run as non-root user
USER nginx

EXPOSE 5000

CMD ["nginx", "-g", "daemon off;"]