import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  API_PORT: z.coerce.number().int().positive().default(3000),
  API_HOST: z.string().default("0.0.0.0"),
  WEB_ORIGIN: z.string().default("http://localhost:5173"),

  // OpenAPI/Swagger: si se define, fuerza on/off ("true"/"false"). Si no, el
  // default depende de NODE_ENV (activo fuera de produccion). Ver isDocsEnabled.
  DOCS_ENABLED: z
    .string()
    .optional()
    .transform((value) => (value === undefined ? undefined : value === "true")),

  // Base de datos (Supabase). Runtime usa DATABASE_URL (pooled) vía driver adapter.
  DATABASE_URL: z.string().min(1, "DATABASE_URL es requerido"),
  DIRECT_URL: z.string().min(1, "DIRECT_URL es requerido"),

  // Auth
  JWT_ACCESS_SECRET: z.string().min(1, "JWT_ACCESS_SECRET es requerido"),
  JWT_REFRESH_SECRET: z.string().min(1, "JWT_REFRESH_SECRET es requerido"),
  JWT_ACCESS_TTL: z.string().default("15m"),
  JWT_REFRESH_TTL: z.string().default("7d"),

  // Supabase Storage
  SUPABASE_URL: z.string().default(""),
  SUPABASE_SERVICE_ROLE_KEY: z.string().default(""),
  SUPABASE_STORAGE_BUCKET: z.string().default("addendas"),

  // SMTP (correo)
  SMTP_HOST: z.string().default(""),
  SMTP_PORT: z.coerce.number().int().default(587),
  SMTP_SECURE: z
    .string()
    .default("false")
    .transform((value) => value === "true"),
  SMTP_USER: z.string().default(""),
  SMTP_PASS: z.string().default(""),
  SMTP_FROM: z.string().default("Addendex <no-reply@example.com>"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Variables de entorno inválidas:");
  for (const issue of parsed.error.issues) {
    console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
  }
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
export const isProduction = env.NODE_ENV === "production";
// Docs OpenAPI: activos en dev/test; en produccion solo si DOCS_ENABLED=true.
export const isDocsEnabled = env.DOCS_ENABLED ?? !isProduction;
