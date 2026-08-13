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
import { EmpresasService } from "./empresas.service.js";
import type { AuthUser } from "../auth/auth.types.js";

@ApiTags("empresas")
@ApiBearerAuth("access-token")
@ApiUnauthorizedResponse({ description: "No autenticado", schema: ERROR_ENVELOPE })
@Controller("empresas")
@UseGuards(JwtAuthGuard)
export class EmpresasController {
  constructor(private readonly empresasService: EmpresasService) {}

  // Catalogo global de empresas para las que el sistema puede generar addendas.
  @Get()
  @ApiOperation({ summary: "Listar empresas registradas" })
  @ApiOkResponse({ description: "Empresas registradas en el sistema" })
  async list(@CurrentUser() _user: AuthUser) {
    return { empresas: await this.empresasService.list() };
  }
}
