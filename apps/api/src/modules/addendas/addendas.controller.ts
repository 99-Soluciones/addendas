import { Body, Controller, Get, HttpCode, Param, Post, Res, UseGuards } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import type { Response } from "express";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard.js";
import { ApiZodBody, ERROR_ENVELOPE } from "../../common/openapi/zod-openapi.js";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe.js";
import { AddendasService } from "./addendas.service.js";
import { createAddendaSchema, emailAddendaSchema, previewSchema } from "./addendas.schema.js";
import type { CreateAddendaInput } from "./addendas.schema.js";
import type { AuthUser } from "../auth/auth.types.js";

@ApiTags("addendas")
@ApiBearerAuth("access-token")
@ApiUnauthorizedResponse({ description: "No autenticado", schema: ERROR_ENVELOPE })
@Controller("addendas")
@UseGuards(JwtAuthGuard)
export class AddendasController {
  constructor(private readonly addendasService: AddendasService) {}

  @Post("preview")
  @HttpCode(200)
  @ApiOperation({ summary: "Previsualizar los datos extraidos de un CFDI" })
  @ApiZodBody(previewSchema)
  @ApiOkResponse({ description: "Datos parseados del CFDI listos para construir la addenda" })
  preview(@Body(new ZodValidationPipe(previewSchema)) dto: { cfdiXml: string }) {
    return this.addendasService.previewCfdi(dto.cfdiXml);
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: "Generar y guardar una addenda" })
  @ApiZodBody(createAddendaSchema)
  @ApiCreatedResponse({ description: "Addenda generada" })
  @ApiBadRequestResponse({
    description: "Datos invalidos o el tipo no corresponde a la empresa",
    schema: ERROR_ENVELOPE,
  })
  @ApiNotFoundResponse({
    description: "Empresa o tipo de addenda no encontrado",
    schema: ERROR_ENVELOPE,
  })
  async create(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(createAddendaSchema)) dto: CreateAddendaInput,
  ) {
    return this.addendasService.createAddenda(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: "Listar las addendas del usuario" })
  @ApiOkResponse({ description: "Addendas del usuario" })
  async list(@CurrentUser() user: AuthUser) {
    return { addendas: await this.addendasService.listAddendas(user.id) };
  }

  @Get(":id")
  @ApiOperation({ summary: "Obtener una addenda por id" })
  @ApiParam({ name: "id", description: "Id de la addenda" })
  @ApiOkResponse({ description: "Addenda solicitada" })
  @ApiNotFoundResponse({
    description: "La addenda no existe o no pertenece al usuario",
    schema: ERROR_ENVELOPE,
  })
  async get(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return { addenda: await this.addendasService.getAddenda(user.id, id) };
  }

  @Get(":id/download")
  @ApiOperation({ summary: "Descargar el XML de la addenda" })
  @ApiParam({ name: "id", description: "Id de la addenda" })
  @ApiProduces("application/xml")
  @ApiOkResponse({ description: "Documento XML de la addenda (attachment)" })
  @ApiNotFoundResponse({
    description: "La addenda no existe o no pertenece al usuario",
    schema: ERROR_ENVELOPE,
  })
  async download(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
    @Res() res: Response,
  ): Promise<void> {
    const { xml, filename } = await this.addendasService.getAddendaXml(user.id, id);
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(xml);
  }

  @Post(":id/email")
  @HttpCode(200)
  @ApiOperation({ summary: "Enviar la addenda por correo" })
  @ApiParam({ name: "id", description: "Id de la addenda" })
  @ApiZodBody(emailAddendaSchema)
  @ApiOkResponse({ description: "Correo enviado" })
  async email(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(emailAddendaSchema)) dto: { to: string },
  ) {
    const result = await this.addendasService.emailAddenda(user.id, id, dto.to);
    return { result };
  }
}
