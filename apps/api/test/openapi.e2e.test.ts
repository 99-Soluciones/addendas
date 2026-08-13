import "reflect-metadata";
import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { AppModule } from "../src/app.module.js";
import { PrismaService } from "../src/prisma/prisma.service.js";
import { createOpenApiDocument } from "../src/openapi.js";

// Construye el documento OpenAPI a partir del grafo real de controladores.
// Es la red de seguridad de la integracion con Swagger: valida que todos los
// esquemas Zod se convierten a OpenAPI (z.toJSONSchema), que el contrato HTTP
// queda documentado y que los esquemas de seguridad existen.

const prismaMock = {
  usuario: { findUnique: vi.fn() },
  refreshToken: { create: vi.fn() },
};

let app: INestApplication;
// OpenAPIObject; tipado laxo para el test (no se typechequea test/).
let doc: ReturnType<typeof createOpenApiDocument>;

beforeAll(async () => {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(PrismaService)
    .useValue(prismaMock)
    .compile();
  app = moduleRef.createNestApplication();
  app.setGlobalPrefix("api/v1");
  await app.init();
  doc = createOpenApiDocument(app);
});

afterAll(async () => {
  await app?.close();
});

describe("OpenAPI document", () => {
  it("incluye las rutas principales de cada modulo", () => {
    const paths = Object.keys(doc.paths);
    expect(paths).toContain("/auth/login");
    expect(paths).toContain("/auth/register");
    expect(paths).toContain("/users");
    expect(paths).toContain("/empresas");
    expect(paths).toContain("/catalogos/tipos");
    expect(paths).toContain("/addendas");
    expect(paths).toContain("/addendas/{id}");
    expect(paths).toContain("/addendas/{id}/download");
    expect(paths).toContain("/dashboard/stats");
    expect(paths).toContain("/health");
  });

  it("documenta el body de login desde el esquema Zod", () => {
    const schema =
      doc.paths["/auth/login"]?.post?.requestBody?.content?.["application/json"]?.schema;
    expect(schema?.type).toBe("object");
    expect(Object.keys(schema?.properties ?? {})).toEqual(
      expect.arrayContaining(["correo", "password"]),
    );
    expect(schema?.properties?.correo?.format).toBe("email");
  });

  it("usa la representacion de input (los .default() quedan opcionales)", () => {
    const schema = doc.paths["/addendas"]?.post?.requestBody?.content?.["application/json"]?.schema;
    const required: string[] = schema?.required ?? [];
    expect(required).toEqual(
      expect.arrayContaining(["tipoAddendaId", "empresaId", "cfdiXml", "datosGlobales"]),
    );
    // `productos` y `tarimas` tienen .default([]) -> opcionales en el cuerpo de la peticion.
    expect(required).not.toContain("productos");
    expect(required).not.toContain("tarimas");
  });

  it("declara los esquemas de seguridad bearer y cookie", () => {
    const schemes = doc.components?.securitySchemes ?? {};
    expect(schemes["access-token"]).toMatchObject({ type: "http", scheme: "bearer" });
    expect(schemes["refresh-token"]).toMatchObject({
      type: "apiKey",
      in: "cookie",
      name: "refresh_token",
    });
  });

  it("marca como protegidos los endpoints tras el JwtAuthGuard", () => {
    const security = doc.paths["/addendas"]?.get?.security ?? [];
    const names = security.flatMap((entry) => Object.keys(entry));
    expect(names).toContain("access-token");
  });
});
