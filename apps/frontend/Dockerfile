
FROM node:18-alpine AS base

# Stage 1: Prune the workspace
FROM base AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune --scope=frontend --docker

# Stage 2: Install dependencies and build
FROM base AS installer
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@9.15.9

# Copy pruned lockfile and package.json
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./

# Install dependencies (regenerate if lockfile has conflicts)
RUN pnpm install --no-frozen-lockfile

# Copy source code
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json

# Build the project
ENV TURBO_TELEMETRY_DISABLED=1
RUN pnpm turbo run build --filter=frontend

# Stage 3: Serve with Nginx
FROM nginx:alpine AS runner
WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./*

# Copy built assets from builder stage
COPY --from=installer /app/apps/frontend/dist .

# Copy custom nginx config
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
