# CLAUDE.md

Este proyecto documenta su contexto, convenciones e invariantes en **[`ai-context.md`](./ai-context.md)**. Léelo antes de hacer cambios.

Puntos que NO se deben romper:

- El builder de addendas (`apps/api/src/modules/addendas/generators/soriana.builder.ts`) es un port verbatim del MVP; su salida debe seguir siendo byte-compatible (golden tests en `__tests__/`). No reformatees su indentación.
- Schemas Postgres: `app_auth` (no `auth`, reservado por Supabase), `core`, `notif`.
- Usa pnpm. Mantén `pnpm -r typecheck`, `pnpm lint` y `pnpm -r test` en verde.
- Sin emojis.
