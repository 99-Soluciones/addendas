import "./src/load-env.js";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  // Conexión usada por la CLI/Migrate (conexión directa de Supabase, :5432).
  // El runtime usa el driver adapter (DATABASE_URL pooled) en src/prisma/prisma.service.ts.
  datasource: {
    url: env("DIRECT_URL"),
  },
});
