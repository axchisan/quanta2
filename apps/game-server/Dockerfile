# Imagen de producción para apps/game-server (Colyseus).
# NOTA: el build context es la RAÍZ del monorepo (necesita el workspace pnpm).
#   docker build -f apps/game-server/Dockerfile -t quanta-game-server .
# En Coolify: Base Directory = / , Dockerfile Location = /apps/game-server/Dockerfile

# ---- Stage 1: build ----
FROM node:22-alpine AS builder
# git: lo necesita la resolución de @colyseus/uwebsockets-transport (dep git
# transitiva de colyseus). NO la usamos en runtime (usamos @colyseus/ws-transport),
# solo necesita resolverse durante el deploy.
RUN corepack enable && apk add --no-cache git
WORKDIR /repo

# Copia el workspace completo (node_modules/dist/etc. excluidos vía .dockerignore)
COPY . .

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @quanta/game-server build

# Empaqueta el app con solo sus deps de producción en /app.
RUN pnpm --filter @quanta/game-server deploy --prod --legacy /app

# ---- Stage 2: runtime ----
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV GAME_SERVER_PORT=2567

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /repo/apps/game-server/dist ./dist

EXPOSE 2567
CMD ["node", "dist/index.js"]
