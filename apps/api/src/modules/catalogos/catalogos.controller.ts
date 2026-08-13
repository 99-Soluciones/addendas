import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard.js";
import { ERROR_ENVELOPE } from "../../common/openapi/zod-openapi.js";
import { CatalogosService } from "./catalogos.service.js";

@ApiTags("catalogos")
@ApiBearerAuth("access-token")
@ApiUnauthorizedResponse({ description: "No autenticado", schema: ERROR_ENVELOPE })
@Controller("catalogos")
@UseGuards(JwtAuthGuard)
export class CatalogosController {
  constructor(private readonly catalogosService: CatalogosService) {}

  @Get("tipos")
  @ApiOperation({ summary: "Listar tipos de addenda (opcionalmente por empresa)" })
  @ApiQuery({ name: "empresaId", required: false, description: "Filtra los tipos por empresa" })
  @ApiOkResponse({ description: "Tipos de addenda" })
  async tipos(@Query("empresaId") empresaId?: string) {
    return { tipos: await this.catalogosService.listTipos(empresaId) };
  }

  @Get("tipos/:id")
  @ApiOperation({ summary: "Obtener un tipo de addenda por id" })
  @ApiParam({ name: "id", description: "Id del tipo de addenda" })
  @ApiOkResponse({ description: "Tipo de addenda con su configuracion de campos" })
  async tipo(@Param("id") id: string) {
    return { tipo: await this.catalogosService.getTipo(id) };
  }
}
