import "reflect-metadata";
import { hash } from "@node-rs/argon2";
import cookieParser from "cookie-parser";
import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { AppModule } from "../src/app.module.js";
import { PrismaService } from "../src/prisma/prisma.service.js";
import { signAccessToken } from "../src/modules/auth/tokens.js";

// e2e: arranca el AppModule completo (valida que toda la DI resuelve) con
// PrismaService mockeado, y comprueba que el contrato HTTP se conserva: rutas,
// guards (401/403), pipe de validacion (400), filtro de errores (404) y cookies.

const PASSWORD = "password123";

const testUser = {
  id: "11111111-1111-1111-1111-111111111111",
  nombre: "Test",
  correo: "test@example.com",
  rol: "USER" as const,
  activo: true,
  passwordHash: "",
};

const prismaMock = {
  usuario: { findUnique: vi.fn() },
  refreshToken: { create: vi.fn() },
  passwordResetToken: { findFirst: vi.fn() },
};

let app: INestApplication;

beforeAll(async () => {
  testUser.passwordHash = await hash(PASSWORD);
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(PrismaService)
    .useValue(prismaMock)
    .compile();
  app = moduleRef.createNestApplication();
  app.setGlobalPrefix("api/v1");
  app.use(cookieParser());
  await app.init();
});

afterAll(async () => {
  await app?.close();
});

describe("API (e2e) - contrato HTTP tras migrar a NestJS", () => {
  it("GET /api/v1/health -> 200 { status: ok }", async () => {
    const res = await request(app.getHttpServer()).get("/api/v1/health");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: "ok" });
    expect(res.body.timestamp).toBeTypeOf("string");
  });

  it("POST /api/v1/auth/login -> 200 con accessToken y cookie de refresh", async () => {
    prismaMock.usuario.findUnique.mockResolvedValueOnce(testUser);
    prismaMock.refreshToken.create.mockResolvedValueOnce({});

    const res = await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .send({ correo: testUser.correo, password: PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeTypeOf("string");
    expect(res.body.user).toMatchObject({ correo: testUser.correo, rol: "USER" });

    const setCookie = res.headers["set-cookie"]?.[0] ?? "";
    expect(setCookie).toContain("refresh_token=");
    expect(setCookie).toContain("Path=/api/v1/auth");
    expect(setCookie).toContain("HttpOnly");
  });

  it("POST /api/v1/auth/login con password incorrecta -> 401 UNAUTHORIZED", async () => {
    prismaMock.usuario.findUnique.mockResolvedValueOnce(testUser);

    const res = await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .send({ correo: testUser.correo, password: "incorrecta" });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  it("POST /api/v1/auth/login con body invalido -> 400 VALIDATION_ERROR", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .send({ correo: "no-es-email" });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("POST /api/v1/auth/forgot-password -> 204 (respuesta generica, sin enumeracion)", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/v1/auth/forgot-password")
      .send({ correo: "cualquiera@example.com" });

    expect(res.status).toBe(204);
  });

  it("POST /api/v1/auth/reset-password con token invalido -> 400 BAD_REQUEST", async () => {
    prismaMock.passwordResetToken.findFirst.mockResolvedValueOnce(null);

    const res = await request(app.getHttpServer())
      .post("/api/v1/auth/reset-password")
      .send({ token: "token-invalido", newPassword: "nuevaPassword123" });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("BAD_REQUEST");
  });

  it("GET /api/v1/auth/me sin token -> 401 UNAUTHORIZED", async () => {
    const res = await request(app.getHttpServer()).get("/api/v1/auth/me");
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  it("GET /api/v1/auth/me con token -> 200 { user }", async () => {
    const token = await signAccessToken(testUser.id, "USER");
    prismaMock.usuario.findUnique.mockResolvedValueOnce({
      id: testUser.id,
      nombre: testUser.nombre,
      correo: testUser.correo,
      rol: "USER",
    });

    const res = await request(app.getHttpServer())
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({ id: testUser.id, rol: "USER" });
  });

  it("GET /api/v1/users con rol USER -> 403 FORBIDDEN (RolesGuard)", async () => {
    const token = await signAccessToken(testUser.id, "USER");
    const res = await request(app.getHttpServer())
      .get("/api/v1/users")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("FORBIDDEN");
  });

  it("ruta inexistente -> 404 NOT_FOUND con el envelope de error", async () => {
    const res = await request(app.getHttpServer()).get("/api/v1/no-existe");
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });
});
