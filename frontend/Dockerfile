# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies - remove package-lock.json and reinstall to avoid rollup bug
RUN rm -rf node_modules package-lock.json && npm install

# Copy source code
COPY . .

# Allow Vite envs to be configured at build time
ARG VITE_API_BASE_URL=""
ARG VITE_DEMO_MODE="false"

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_DEMO_MODE=$VITE_DEMO_MODE

# Build the application
RUN npm run build

# Production stage with nginx
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Install curl for healthcheck and set proper permissions
RUN apk add --no-cache curl && \
    chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Don't switch to non-root user - nginx needs root to bind to port 80
# USER nginx

# Expose port
EXPOSE 80

# Health check - use curl instead of wget for proper health checking
HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=10s \
  CMD curl -f http://localhost/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
