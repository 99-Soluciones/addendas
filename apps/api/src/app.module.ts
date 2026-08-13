import { Module } from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";
import { LoggerModule } from "nestjs-pino";
import { AppExceptionFilter } from "./common/filters/app-exception.filter.js";
import { HealthController } from "./health.controller.js";
import { logger } from "./lib/logger.js";
import { PrismaModule } from "./prisma/prisma.module.js";
import { AddendasModule } from "./modules/addendas/addendas.module.js";
import { AuthModule } from "./modules/auth/auth.module.js";
import { CatalogosModule } from "./modules/catalogos/catalogos.module.js";
import { DashboardModule } from "./modules/dashboard/dashboard.module.js";
import { EmpresasModule } from "./modules/empresas/empresas.module.js";
import { UsersModule } from "./modules/users/users.module.js";

@Module({
  imports: [
    // Reusa la instancia pino existente para el logging de peticiones (pino-http).
    LoggerModule.forRoot({ pinoHttp: { logger } }),
    PrismaModule,
    AuthModule,
    UsersModule,
    CatalogosModule,
    EmpresasModule,
    AddendasModule,
    DashboardModule,
  ],
  controllers: [HealthController],
  providers: [
    // Filtro global: misma forma de error que el errorHandler de Express.
    { provide: APP_FILTER, useClass: AppExceptionFilter },
  ],
})
export class AppModule {}
