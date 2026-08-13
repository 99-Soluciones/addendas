import { Controller, Get, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard.js";
import { ERROR_ENVELOPE } from "../../common/openapi/zod-openapi.js";
import { DashboardService } from "./dashboard.service.js";
import type { AuthUser } from "../auth/auth.types.js";

@ApiTags("dashboard")
@ApiBearerAuth("access-token")
@ApiUnauthorizedResponse({ description: "No autenticado", schema: ERROR_ENVELOPE })
@Controller("dashboard")
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get("stats")
  @ApiOperation({ summary: "Metricas del usuario para el dashboard" })
  @ApiOkResponse({ description: "Estadisticas agregadas del usuario" })
  async stats(@CurrentUser() user: AuthUser) {
    return this.dashboardService.getStats(user.id);
  }
}
