
FROM node:18-alpine AS base

# Stage 1: Prune the workspace
FROM base AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune --scope=@myapp/backend --docker

# Stage 2: Install dependencies and build
FROM base AS installer
RUN apk add --no-cache libc6-compat python3 make g++
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
RUN pnpm turbo run build --filter=@myapp/backend

# Stage 3: Prepare production dependencies (for native modules)
FROM base AS prod-deps
WORKDIR /app
RUN apk add --no-cache python3 make g++
RUN npm install -g pnpm@9.15.9
COPY --from=installer /app/apps/backend/package.json .
# We don't have a lockfile for the isolated app, so we just install. 
# Ideally we would use the pruned lockfile if it matched, but the pruned lockfile is for the workspace.
# Since we only need a few native modules (ssh2, sqlite3), a fresh install is usually fine.
RUN pnpm install --prod

# Stage 4: Run the application
FROM base AS runner
WORKDIR /app

# Don't run as root
RUN addgroup --system --gid 1001 expressjs
RUN adduser --system --uid 1001 expressjs
USER expressjs

# Copy built application
COPY --from=installer /app/apps/backend/build ./dist
# Copy production dependencies
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=installer /app/apps/backend/package.json .
# Copy .env if needed, or rely on environment variables
# COPY --from=installer /app/apps/backend/.env . 

CMD ["node", "dist/index.js"]
