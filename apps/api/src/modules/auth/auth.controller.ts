import { Body, Controller, Get, HttpCode, Post, Req, Res, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import type { Request, Response } from "express";
import { env } from "../../config/env.js";
import { UnauthorizedError } from "../../utils/http-errors.js";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard.js";
import { ApiZodBody, ERROR_ENVELOPE } from "../../common/openapi/zod-openapi.js";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe.js";
import { AuthService } from "./auth.service.js";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "./auth.schema.js";
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from "./auth.schema.js";
import { parseDurationMs } from "./tokens.js";
import type { AuthUser } from "./auth.types.js";

const REFRESH_COOKIE = "refresh_token";
const REFRESH_TTL_MS = parseDurationMs(env.JWT_REFRESH_TTL);

function setRefreshCookie(res: Response, token: string): void {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/v1/auth",
    maxAge: REFRESH_TTL_MS,
  });
}

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @HttpCode(201)
  @ApiOperation({ summary: "Registrar un usuario y abrir sesion" })
  @ApiZodBody(registerSchema)
  @ApiCreatedResponse({
    description: "Usuario creado; devuelve accessToken y user, y fija la cookie refresh_token",
  })
  async register(
    @Body(new ZodValidationPipe(registerSchema)) dto: RegisterInput,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken, user } = await this.authService.register(dto);
    setRefreshCookie(res, refreshToken);
    return { accessToken, user };
  }

  @Post("login")
  @HttpCode(200)
  @ApiOperation({ summary: "Iniciar sesion con correo y contrasena" })
  @ApiZodBody(loginSchema)
  @ApiOkResponse({ description: "Devuelve accessToken y user, y fija la cookie refresh_token" })
  @ApiUnauthorizedResponse({ description: "Credenciales invalidas", schema: ERROR_ENVELOPE })
  async login(
    @Body(new ZodValidationPipe(loginSchema)) dto: LoginInput,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken, user } = await this.authService.login(dto);
    setRefreshCookie(res, refreshToken);
    return { accessToken, user };
  }

  @Post("forgot-password")
  @HttpCode(204)
  @ApiOperation({ summary: "Solicitar un enlace de recuperacion de contrasena" })
  @ApiZodBody(forgotPasswordSchema)
  @ApiNoContentResponse({ description: "Si el correo existe, se envia un enlace de recuperacion" })
  async forgotPassword(
    @Body(new ZodValidationPipe(forgotPasswordSchema)) dto: ForgotPasswordInput,
  ): Promise<void> {
    await this.authService.requestPasswordReset(dto.correo);
  }

  @Post("reset-password")
  @HttpCode(204)
  @ApiOperation({ summary: "Restablecer la contrasena con un token de recuperacion" })
  @ApiZodBody(resetPasswordSchema)
  @ApiNoContentResponse({ description: "Contrasena actualizada" })
  async resetPassword(
    @Body(new ZodValidationPipe(resetPasswordSchema)) dto: ResetPasswordInput,
  ): Promise<void> {
    await this.authService.resetPassword(dto.token, dto.newPassword);
  }

  @Post("refresh")
  @HttpCode(200)
  @ApiCookieAuth("refresh-token")
  @ApiOperation({ summary: "Rotar la sesion usando la cookie refresh_token" })
  @ApiOkResponse({ description: "Nuevo accessToken y rotacion de la cookie refresh_token" })
  @ApiUnauthorizedResponse({
    description: "No hay sesion activa o el refresh token es invalido",
    schema: ERROR_ENVELOPE,
  })
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    if (!token) {
      throw new UnauthorizedError("No hay sesión activa");
    }
    const { accessToken, refreshToken, user } = await this.authService.refreshSession(token);
    setRefreshCookie(res, refreshToken);
    return { accessToken, user };
  }

  @Post("logout")
  @HttpCode(204)
  @ApiCookieAuth("refresh-token")
  @ApiOperation({ summary: "Cerrar sesion e invalidar el refresh token" })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<void> {
    const token = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    await this.authService.logout(token);
    res.clearCookie(REFRESH_COOKIE, { path: "/api/v1/auth" });
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Obtener el usuario autenticado" })
  @ApiOkResponse({ description: "Datos del usuario en sesion" })
  @ApiUnauthorizedResponse({ description: "No autenticado", schema: ERROR_ENVELOPE })
  async me(@CurrentUser() user: AuthUser) {
    return { user: await this.authService.getMe(user.id) };
  }
}
