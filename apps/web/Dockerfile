# Imagen de producción para apps/web (Next.js 15, salida standalone).
# NOTA: el build context es la RAÍZ del monorepo (necesita el workspace pnpm).
#   docker build -f apps/web/Dockerfile -t quanta-web .
# En Coolify: Base Directory = / , Dockerfile Location = /apps/web/Dockerfile

# ---- Stage 1: build ----
FROM node:22-alpine AS builder
RUN corepack enable
WORKDIR /repo

# Copia el workspace completo (node_modules/.next/etc. excluidos vía .dockerignore)
COPY . .

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @quanta/web build

# ---- Stage 2: runtime ----
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup -g 1001 -S nodejs && adduser -u 1001 -G nodejs -S nextjs

# Salida standalone: preserva el layout del monorepo bajo .next/standalone
COPY --from=builder --chown=nextjs:nodejs /repo/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /repo/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /repo/apps/web/public ./apps/web/public

USER nextjs
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
