import { Body, Controller, Get, HttpCode, Patch, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import { Roles } from "../../common/decorators/roles.decorator.js";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard.js";
import { RolesGuard } from "../../common/guards/roles.guard.js";
import { ApiZodBody, ERROR_ENVELOPE } from "../../common/openapi/zod-openapi.js";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe.js";
import { UsersService } from "./users.service.js";
import { changePasswordSchema, updateProfileSchema } from "./users.schema.js";
import type { ChangePasswordInput, UpdateProfileInput } from "./users.schema.js";
import type { AuthUser } from "../auth/auth.types.js";

@ApiTags("users")
@ApiBearerAuth("access-token")
@ApiUnauthorizedResponse({ description: "No autenticado", schema: ERROR_ENVELOPE })
@Controller("users")
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Solo admin: listado de usuarios registrados.
  @Get()
  @Roles("ADMIN")
  @ApiOperation({ summary: "Listar usuarios registrados (solo ADMIN)" })
  @ApiOkResponse({ description: "Lista de usuarios" })
  @ApiForbiddenResponse({ description: "Requiere rol ADMIN", schema: ERROR_ENVELOPE })
  async list() {
    return { users: await this.usersService.listUsers() };
  }

  // Cuenta propia.
  @Patch("me")
  @ApiOperation({ summary: "Actualizar el perfil propio" })
  @ApiZodBody(updateProfileSchema)
  @ApiOkResponse({ description: "Perfil actualizado" })
  async updateProfile(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(updateProfileSchema)) dto: UpdateProfileInput,
  ) {
    return { user: await this.usersService.updateProfile(user.id, dto) };
  }

  @Patch("me/password")
  @HttpCode(204)
  @ApiOperation({ summary: "Cambiar la contrasena propia" })
  @ApiZodBody(changePasswordSchema)
  @ApiNoContentResponse({ description: "Contrasena actualizada" })
  async changePassword(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(changePasswordSchema)) dto: ChangePasswordInput,
  ): Promise<void> {
    await this.usersService.changePassword(user.id, dto.currentPassword, dto.newPassword);
  }
}
