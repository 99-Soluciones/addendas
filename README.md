# Addendex

Plataforma SaaS para generar addendas de CFDI 4.0 (Soriana y otras cadenas comerciales) a partir de un XML base. Migración del MVP estático `Addenda-Soriana` a una arquitectura escalable.

## Arquitectura

Monolito modular en monorepo **pnpm**:

| Paquete           | Descripción                                                                       |
| ----------------- | --------------------------------------------------------------------------------- |
| `apps/api`        | API NestJS 11 (sobre Express 5) + TypeScript + Prisma 7 (PostgreSQL en Supabase). |
| `apps/web`        | SPA React 19 + Vite 8 + Tailwind v4.                                              |
| `packages/shared` | Tipos y esquemas Zod compartidos (descriptor de campos dinámicos).                |

## Stack

Node 22 · pnpm 10 · TypeScript 6 · NestJS 11 (Express 5) · Prisma 7 · React 19 · Vite 8 · Tailwind v4 · Zod 4 · PostgreSQL (Supabase).

## Puesta en marcha

```bash
pnpm install
cp .env.example .env   # rellena las variables (Supabase, JWT, SMTP)

# Base de datos
pnpm api db:migrate    # aplica migraciones en dev
pnpm api db:seed

# Desarrollo
pnpm dev               # api (:3000) + web (:5173) en paralelo
```

Documentación OpenAPI/Swagger de la API disponible en `/api/v1/docs` (activa en dev/test; en producción requiere `DOCS_ENABLED=true`).

## Scripts raíz

- `pnpm dev` — api y web en paralelo.
- `pnpm build` — build de todos los paquetes.
- `pnpm typecheck` / `pnpm lint` / `pnpm test` — calidad en todos los paquetes.
- `pnpm format` — Prettier sobre el repo.

> Convenciones, reglas de estilo e invariantes del dominio: ver [`ai-context.md`](./ai-context.md).
