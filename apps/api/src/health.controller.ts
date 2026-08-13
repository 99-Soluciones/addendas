import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { PrismaService } from "./prisma/prisma.service.js";

@ApiTags("health")
@Controller()
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("health")
  @ApiOperation({ summary: "Liveness del servicio" })
  @ApiOkResponse({ description: "El servicio responde" })
  health() {
    return { status: "ok", timestamp: new Date().toISOString() };
  }

  // Comprueba conectividad real con la base de datos. El rechazo de la promesa
  // se reenvia al AppExceptionFilter si la consulta falla.
  @Get("health/db")
  @ApiOperation({ summary: "Readiness: conectividad con la base de datos" })
  @ApiOkResponse({ description: "La base de datos responde" })
  async healthDb() {
    await this.prisma.$queryRaw`SELECT 1`;
    return { status: "ok", db: "up" };
  }
}
