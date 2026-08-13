import "./load-env.js";
import "reflect-metadata";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import type { NextFunction, Request, Response } from "express";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import { NestFactory } from "@nestjs/core";
import { Logger } from "nestjs-pino";
import { AppModule } from "./app.module.js";
import { env, isDocsEnabled } from "./config/env.js";
import { logger } from "./lib/logger.js";
import { DOCS_PATH, setupSwagger } from "./openapi.js";

async function bootstrap(): Promise<void> {
  // bodyParser: false -> registramos express.json con limite amplio mas abajo.
  const app = await NestFactory.create(AppModule, { bodyParser: false, bufferLogs: true });

  // Logs internos de Nest a traves de pino.
  app.useLogger(app.get(Logger));

  (app.getHttpAdapter().getInstance() as express.Express).disable("x-powered-by");

  // helmet en todo. Cuando los docs estan activos se omite solo en su ruta:
  // Swagger UI usa scripts/estilos inline que la CSP por defecto bloquearia.
  const helmetMw = helmet();
  if (isDocsEnabled) {
    const docsPrefix = `/${DOCS_PATH}`;
    app.use((req: Request, res: Response, next: NextFunction) => {
      if (req.path.startsWith(docsPrefix)) {
        next();
        return;
      }
      helmetMw(req, res, next);
    });
  } else {
    app.use(helmetMw);
  }
  app.use(cors({ origin: env.WEB_ORIGIN, credentials: true }));
  // El CFDI puede ser grande; permitimos cuerpos JSON amplios.
  app.use(express.json({ limit: "5mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Limite estricto y dedicado para endpoints sensibles de auth (anti fuerza bruta
  // y abuso de envio de correos). Se monta antes del limite global. No incluye
  // /auth/refresh, que se invoca de forma rutinaria al cargar la app.
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: {
      error: { code: "RATE_LIMITED", message: "Demasiados intentos, intenta más tarde" },
    },
  });
  for (const path of [
    "/api/v1/auth/login",
    "/api/v1/auth/register",
    "/api/v1/auth/forgot-password",
    "/api/v1/auth/reset-password",
  ]) {
    app.use(path, authLimiter);
  }

  // Limite global (backstop) en toda la API.
  app.use(
    "/api/v1",
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 300,
      standardHeaders: "draft-7",
      legacyHeaders: false,
      message: {
        error: { code: "RATE_LIMITED", message: "Demasiadas solicitudes, intenta más tarde" },
      },
    }),
  );

  app.setGlobalPrefix("api/v1/");

  // OpenAPI: UI en /api/v1/docs y JSON en /api/v1/docs-json (solo si esta activo).
  if (isDocsEnabled) {
    setupSwagger(app);
    logger.info(`OpenAPI docs habilitados en /${DOCS_PATH}`);
  }

  app.enableShutdownHooks();

  await app.listen(env.API_PORT, env.API_HOST);
  logger.info(`API escuchando en http://${env.API_HOST}:${env.API_PORT} (${env.NODE_ENV})`);
}

void bootstrap();
