# AI Context — Addendex

Contexto para cualquier IA que trabaje en este repositorio. Léelo antes de generar código.

## Qué es

**Addendex** — SaaS para generar **addendas de CFDI 4.0** (Soriana y, a futuro, otras cadenas) a partir de un XML base. Es la migración del MVP estático `Addenda-Soriana` (HTML/CSS/Vanilla JS) a una plataforma multiusuario.

**Invariante crítico:** el XML de addenda que produce el backend debe ser **byte-compatible con el MVP** (salvo indentación, irrelevante para Soriana). El MVP es la fuente de verdad de la lógica. Está verificado contra una addenda real de Soriana (`apps/api/scripts/verify-real.ts`).

## Arquitectura

Monolito modular en monorepo **pnpm** (NO microservicios):

- `apps/api` — API REST NestJS 11 (sobre Express, `@nestjs/platform-express`) + TypeScript + Prisma 7. Un `PrismaService` (PrismaClient) global vía DI.
- `apps/web` — SPA React 19 + Vite 8 + Tailwind v4.
- `packages/shared` — tipos + Zod compartidos. Define el descriptor de campos dinámicos y `buildZodSchema` (lo usan frontend y backend para validar igual).

## Stack (versiones exactas)

Node 22 · pnpm 10 · TypeScript 6 · NestJS 11 (sobre Express 5.2) · Prisma 7.8 · React 19.2 · Vite 8 · Tailwind v4 · Zod 4.4 · PostgreSQL (Supabase). Auth: `jose` (JWT) + `@node-rs/argon2`. Logs: `pino` vía `nestjs-pino`. Correo: `nodemailer`. XML: `fast-xml-parser`. OpenAPI: `@nestjs/swagger` + conversor nativo de Zod 4 (`z.toJSONSchema`).

ESM + decoradores: `apps/api` mantiene ESM (`NodeNext`, imports con `.js`) con `experimentalDecorators`/`emitDecoratorMetadata`. Dev corre con `@swc-node/register` (esbuild/tsx no emite metadata de decoradores); build de produccion con `tsc`; tests con Vitest + `unplugin-swc`. La regla lint `consistent-type-imports` esta desactivada en `apps/api` (un `import type` en una dependencia inyectada rompe la metadata de DI).

## Base de datos

PostgreSQL en Supabase. Prisma 7 con **driver adapter** (`@prisma/adapter-pg`): runtime usa `DATABASE_URL` (pooled, :6543); CLI/migraciones usan `DIRECT_URL` (:5432), definido en `prisma.config.ts` (NO en el `datasource` del schema, que en Prisma 7 ya no acepta `url`).

**multiSchema** con 3 namespaces: `app_auth` (identidad — NO usar `auth`, lo reserva Supabase), `core` (dominio), `notif` (notificaciones). Hay **FKs reales cross-schema**. Cliente generado en `apps/api/src/generated/prisma` (gitignored; correr `prisma generate`).

Migraciones en `apps/api/prisma/migrations` (aplicar con `prisma migrate deploy`). Triggers `set_updated_at` a nivel DB.

## Convenciones de código

- **TypeScript estricto** (`tsconfig.base.json`): `strict`, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`. Usa `import type` para tipos.
- **Módulos ESM**: api/shared `NodeNext` (imports relativos con extensión `.js`); web `Bundler` (sin extensión).
- **api por módulo de dominio** (`src/modules/<dominio>/`): `*.module.ts` que agrupa `*.controller.ts` (decoradores NestJS, `@Controller`) y `*.service.ts` (`@Injectable`, DI por constructor) (+ `*.schema.ts` Zod). La lógica de negocio vive en services; los controllers solo orquestan. Infra transversal en `src/common/` (guards, pipes, filters, decorators) y `src/prisma/`.
- **Nombres**: dominio en español (`usuarios`, `empresas`, `addendas`); tablas/columnas snake_case vía `@map`, modelos/campos camelCase en TS.
- **Errores**: lanza `AppError` y subclases (`utils/http-errors.ts`); el `AppExceptionFilter` global (`common/filters/`) las formatea como `{ error: { code, message, details } }`. Zod errores → 400. Nunca `try/catch` que silencie.
- **Validación**: Zod en el borde con `ZodValidationPipe` (`common/pipes/`), aplicado por ruta: `@Body(new ZodValidationPipe(schema)) dto`. El **mismo** esquema Zod documenta el body en OpenAPI vía `@ApiZodBody(schema)` (`common/openapi/zod-openapi.ts`, usa `z.toJSONSchema`), sin duplicar la definición ni usar class-validator.
- **Sin emojis** en código, UI ni mensajes.
- Gestor **pnpm** siempre (no npm/yarn).

## Auth

JWT access (jose, HS256, 15m) en header `Authorization: Bearer`. Refresh token **opaco** rotado, guardado hasheado (SHA-256) en `app_auth.refresh_tokens`, en cookie httpOnly con scope `/api/v1/auth`. Hash de contraseñas con argon2. Guards: `JwtAuthGuard` y `RolesGuard` + decorador `@Roles("ADMIN")` (`common/guards/`, `common/decorators/`); el usuario autenticado se inyecta con `@CurrentUser()`. Roles: `USER` (genera addendas) y `ADMIN` (ve usuarios, no genera).

## Frontend

- Estado: **Zustand** (sesión/cliente, access token en memoria) + **TanStack Query** (servidor). La sesión se rehidrata al cargar con `/auth/refresh`.
- Formularios: **React Hook Form + Zod**. Los formularios de addenda son **dinámicos**, generados desde `tipos_addenda.configuracion_campos` (JSONB) con `buildZodSchema` de `@addendex/shared`.
- API: `shared/api/client.ts` (`apiFetch`) añade el token y hace refresh+retry en 401. En dev, proxy Vite `/api`→:3000 (mismo-origen).
- UI: Tailwind v4 con tokens en `@theme` (`src/styles/index.css`). Paleta tipo besthorrorscenes (negros/grises/rojo `--color-accent`), fuente **Josefin Sans**, iconos SVG (lucide-react), animaciones suaves.

## Generación de addendas (lo más sensible)

`apps/api/src/modules/addendas/generators/`:

- `cfdi.parser.ts` — port de `getXMLData.js`. Deduplica conceptos por `Descripcion`, suma Cantidad/Importe. Precisiones: `SubTotal`/`ValorUnitario`/`Importe` `.toFixed(6)`, `Cantidad`/IVA `.toFixed(2)`.
- `soriana.builder.ts` — port **verbatim** de `generarAddenda.js`. **La indentación literal (4/8/12 espacios) y el `join('        ')` son significativos.** No reformatear; romperían los golden tests.
- `registry.ts` — mapea cadena → generador.
- Tests golden byte-compatibles en `__tests__/` (Consolidada y Extemporanea).

**Quirks del MVP preservados a propósito** (no "arreglar" sin avisar): `impuestos.TasaIVA` guarda el IMPORTE del IVA, no la tasa; el builder NO escapa XML; `ValorUnitario` no se recalcula al deduplicar.

## Comandos

```
pnpm install
pnpm dev                              # api + web
pnpm --filter @addendex/api dev        # API :3000
pnpm --filter @addendex/web dev        # Web :5173
pnpm -r typecheck | pnpm lint | pnpm -r test
pnpm --filter @addendex/api db:deploy  # aplica migraciones
pnpm --filter @addendex/api db:seed
```

## Mapa rápido

- Esquema BD: `apps/api/prisma/schema.prisma`
- Bootstrap API: `apps/api/src/main.ts`, `app.module.ts`, `config/env.ts`, `prisma/prisma.service.ts`
- Generadores: `apps/api/src/modules/addendas/generators/`
- OpenAPI: `apps/api/src/openapi.ts` (DocumentBuilder/SwaggerModule) y `common/openapi/zod-openapi.ts` (Zod→OpenAPI). UI en `/api/v1/docs`, JSON en `/api/v1/docs-json`. Gateado por `DOCS_ENABLED` (`config/env.ts` → `isDocsEnabled`): activo en dev/test, apagado en producción salvo `DOCS_ENABLED=true`.
- App web: `apps/web/src/app/` (router, layouts), `features/`, `shared/`
- Diagramas: `docs/diagrams/`
