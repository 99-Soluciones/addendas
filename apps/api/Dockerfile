# syntax=docker/dockerfile:1
# Build context = raíz del monorepo (ver docker-compose.yml).

FROM node:22-alpine AS build
RUN corepack enable
WORKDIR /app
COPY . .
RUN pnpm install --no-frozen-lockfile
RUN pnpm --filter @addendex/shared build
# prisma.config.ts resuelve DIRECT_URL al cargar; prisma generate no se
# conecta a la BD pero igual necesita la variable definida (ver ci.yml).
ENV DATABASE_URL="postgresql://user:pass@localhost:5432/db"
ENV DIRECT_URL="postgresql://user:pass@localhost:5432/db"
RUN pnpm --filter @addendex/api exec prisma generate
RUN pnpm --filter @addendex/api build
# Genera un bundle de producción autocontenido (inyecta @addendex/shared).
RUN pnpm --filter=@addendex/api deploy --legacy --prod /prod/api

FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /prod/api ./
USER node
EXPOSE 3000
# Las migraciones se aplican aparte: pnpm --filter @addendex/api db:deploy
CMD ["node", "dist/main.js"]
