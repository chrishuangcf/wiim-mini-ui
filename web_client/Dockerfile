# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Set SSL environment variables for build stage
ARG NODE_TLS_REJECT_UNAUTHORIZED=0
ENV NODE_TLS_REJECT_UNAUTHORIZED=${NODE_TLS_REJECT_UNAUTHORIZED}
ENV YARN_DISABLE_SELF_UPDATE_CHECK=true
ENV YARN_ENABLE_PROGRESS_BARS=false

# Use HTTP repositories for Alpine to avoid SSL issues
RUN sed -i 's/https/http/g' /etc/apk/repositories && \
    apk update && \
    apk add --no-cache ca-certificates

# Copy package files
COPY package.json yarn.lock* package-lock.json* ./

# Install dependencies with SSL handling
RUN set -ex; \
    if [ -f yarn.lock ]; then \
        yarn config set strict-ssl false; \
        yarn install --frozen-lockfile --network-timeout 100000; \
    elif [ -f package-lock.json ]; then \
        npm config set strict-ssl false; \
        npm ci --legacy-peer-deps; \
    else \
        npm config set strict-ssl false; \
        npm install --legacy-peer-deps; \
    fi

# Copy source code
COPY . .

# Build the application
RUN if [ -f yarn.lock ]; then yarn build; \
    else npm run build; fi

# Production stage
FROM nginx:alpine

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
