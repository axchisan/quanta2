# NOTE: build context is the MONOREPO ROOT, not this directory.
#   docker build -f apps/game-server/Dockerfile -t quanta-game-server .
# The build needs the pnpm workspace (root manifests + workspace packages).

# ---- Stage 1: build ----
FROM node:22-alpine AS builder
WORKDIR /repo

RUN corepack enable && corepack prepare pnpm@latest --activate

# Workspace + root manifests (cache-friendly layer)
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json tsconfig.base.json ./

# Manifests of the workspace packages this app depends on
COPY packages/config/package.json packages/config/package.json
COPY packages/types/package.json packages/types/package.json
COPY apps/game-server/package.json apps/game-server/package.json

RUN pnpm install --frozen-lockfile

# Source of this app and the packages it bundles
COPY packages/config packages/config
COPY packages/types packages/types
COPY apps/game-server apps/game-server

RUN pnpm --filter @quanta/game-server build

# Prune to production deps only for the runtime image
RUN pnpm --filter @quanta/game-server deploy --prod --legacy /app

# ---- Stage 2: runtime ----
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /repo/apps/game-server/dist ./dist

EXPOSE 2567
CMD ["node", "dist/index.js"]
