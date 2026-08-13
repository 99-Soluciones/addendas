import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import type { INestApplication } from "@nestjs/common";

/**
 * Configuracion de OpenAPI/Swagger. Se sirve la UI y el JSON bajo el mismo
 * prefijo global que la API (`/api/v1`). La validacion sigue corriendo via
 * ZodValidationPipe; aqui solo se documenta el contrato.
 */
export const DOCS_PATH = "api/v1/docs";

export function buildOpenApiConfig() {
  return (
    new DocumentBuilder()
      .setTitle("Addendex API")
      .setDescription(
        "API REST para generar addendas de CFDI 4.0 (Soriana y otras cadenas). " +
          "Autenticacion: access token JWT (Bearer, 15m) y refresh token opaco en " +
          "cookie httpOnly con scope /api/v1/auth.",
      )
      .setVersion("1.0.0")
      // Las operaciones se documentan relativas al controlador; el server aporta el
      // prefijo global para que "Try it out" apunte a /api/v1/...
      .addServer("/api/v1", "Prefijo global de la API")
      .addBearerAuth(
        { type: "http", scheme: "bearer", bearerFormat: "JWT", description: "Access token JWT" },
        "access-token",
      )
      .addCookieAuth(
        "refresh_token",
        { type: "apiKey", in: "cookie", name: "refresh_token" },
        "refresh-token",
      )
      .addTag("auth", "Registro, login, refresh y sesion")
      .addTag("users", "Cuenta propia y administracion de usuarios")
      .addTag("empresas", "Empresas asignadas al usuario")
      .addTag("catalogos", "Empresas y tipos de addenda")
      .addTag("addendas", "Generacion, descarga y envio de addendas")
      .addTag("dashboard", "Metricas del usuario")
      .addTag("health", "Estado del servicio")
      .build()
  );
}

/** Construye el documento OpenAPI a partir del grafo de controladores del app. */
export function createOpenApiDocument(app: INestApplication) {
  // ignoreGlobalPrefix: las rutas quedan relativas al controlador (/addendas) y
  // el server (.addServer "/api/v1") aporta el prefijo, en vez de repetirlo en
  // cada path. Asi "Try it out" apunta a /api/v1/... sin duplicar el prefijo.
  return SwaggerModule.createDocument(app, buildOpenApiConfig(), { ignoreGlobalPrefix: true });
}

/** Registra la UI de Swagger y el JSON en `/api/v1/docs`. */
export function setupSwagger(app: INestApplication): void {
  SwaggerModule.setup(DOCS_PATH, app, createOpenApiDocument(app), {
    jsonDocumentUrl: `${DOCS_PATH}-json`,
    customSiteTitle: "Addendex API",
    swaggerOptions: { persistAuthorization: true },
  });
}
