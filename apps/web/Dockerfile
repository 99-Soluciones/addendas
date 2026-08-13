# syntax=docker/dockerfile:1
# Build context = raíz del monorepo (ver docker-compose.yml).

FROM node:22-alpine AS build
RUN corepack enable
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @addendex/shared build
RUN pnpm --filter @addendex/web build

FROM nginx:alpine AS runtime
# nginx sirve la SPA y actúa como API gateway (/api -> api:3000).
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
