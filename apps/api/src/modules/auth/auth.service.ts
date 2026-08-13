import { hash, verify } from "@node-rs/argon2";
import { Injectable, Logger } from "@nestjs/common";
import { LEGAL_DOCS, LEGAL_DOC_IDS } from "@addendex/shared";
import type { LegalDocId } from "@addendex/shared";
import { env } from "../../config/env.js";
import { BadRequestError, ConflictError, UnauthorizedError } from "../../utils/http-errors.js";
import { PrismaService } from "../../prisma/prisma.service.js";
import { EmailService } from "../notifications/email.service.js";
import {
  generateRefreshToken,
  generateResetToken,
  hashToken,
  parseDurationMs,
  signAccessToken,
} from "./tokens.js";
import type { LoginInput, RegisterInput } from "./auth.schema.js";
import type { PublicUser, Rol } from "./auth.types.js";

const REFRESH_TTL_MS = parseDurationMs(env.JWT_REFRESH_TTL);
const RESET_TTL_MS = 60 * 60 * 1000; // 1 hora

// Mapea el id del documento legal (shared) al enum de Prisma.
const DOCUMENTO_POR_ID = {
  terminos: "TERMINOS",
  privacidad: "PRIVACIDAD",
  cookies: "COOKIES",
} as const satisfies Record<LegalDocId, string>;

interface Session {
  accessToken: string;
  refreshToken: string;
  user: PublicUser;
}

function toPublicUser(user: { id: string; nombre: string; correo: string; rol: Rol }): PublicUser {
  return { id: user.id, nombre: user.nombre, correo: user.correo, rol: user.rol };
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  private async issueSession(user: { id: string; rol: Rol }): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const accessToken = await signAccessToken(user.id, user.rol);
    const { token: refreshToken, tokenHash } = generateRefreshToken();
    await this.prisma.refreshToken.create({
      data: {
        usuarioId: user.id,
        tokenHash,
        expiraEn: new Date(Date.now() + REFRESH_TTL_MS),
      },
    });
    return { accessToken, refreshToken };
  }

  async register(input: RegisterInput): Promise<Session> {
    const existing = await this.prisma.usuario.findUnique({ where: { correo: input.correo } });
    if (existing) {
      throw new ConflictError("Ya existe una cuenta con ese correo");
    }
    const passwordHash = await hash(input.password);
    // Crea el usuario y registra el consentimiento legal de forma atomica.
    const user = await this.prisma.$transaction(async (tx) => {
      const created = await tx.usuario.create({
        data: { nombre: input.nombre, correo: input.correo, passwordHash, rol: "USER" },
      });
      await tx.consentimiento.createMany({
        data: LEGAL_DOC_IDS.map((id) => ({
          usuarioId: created.id,
          documento: DOCUMENTO_POR_ID[id],
          version: LEGAL_DOCS[id].version,
        })),
      });
      return created;
    });
    const tokens = await this.issueSession(user);
    return { ...tokens, user: toPublicUser(user) };
  }

  /**
   * Solicita un enlace de recuperacion. No revela si el correo existe: responde
   * igual exista o no la cuenta (y cuando SMTP no esta configurado).
   */
  async requestPasswordReset(correo: string): Promise<void> {
    if (!this.emailService.isConfigured()) {
      this.logger.warn("Solicitud de recuperacion ignorada: SMTP no configurado");
      return;
    }
    const user = await this.prisma.usuario.findUnique({ where: { correo } });
    if (!user || !user.activo) {
      return;
    }
    const { token, tokenHash } = generateResetToken();
    await this.prisma.passwordResetToken.create({
      data: {
        usuarioId: user.id,
        tokenHash,
        expiraEn: new Date(Date.now() + RESET_TTL_MS),
      },
    });
    const resetUrl = `${env.WEB_ORIGIN}/restablecer-password?token=${token}`;
    await this.emailService.sendPasswordReset({
      to: user.correo,
      nombre: user.nombre,
      resetUrl,
    });
  }

  /** Restablece la contrasena a partir de un token de recuperacion valido. */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const tokenHash = hashToken(token);
    const record = await this.prisma.passwordResetToken.findFirst({
      where: { tokenHash, usado: false },
    });
    if (!record || record.expiraEn < new Date()) {
      throw new BadRequestError("El enlace de recuperación es inválido o expiró");
    }
    const passwordHash = await hash(newPassword);
    // Actualiza la contrasena, marca el token usado e invalida sesiones previas.
    await this.prisma.$transaction([
      this.prisma.usuario.update({ where: { id: record.usuarioId }, data: { passwordHash } }),
      this.prisma.passwordResetToken.update({ where: { id: record.id }, data: { usado: true } }),
      this.prisma.refreshToken.updateMany({
        where: { usuarioId: record.usuarioId },
        data: { revocado: true },
      }),
    ]);
  }

  async login(input: LoginInput): Promise<Session> {
    const user = await this.prisma.usuario.findUnique({ where: { correo: input.correo } });
    if (!user || !user.activo) {
      throw new UnauthorizedError("Credenciales inválidas");
    }
    const ok = await verify(user.passwordHash, input.password);
    if (!ok) {
      throw new UnauthorizedError("Credenciales inválidas");
    }
    const tokens = await this.issueSession(user);
    return { ...tokens, user: toPublicUser(user) };
  }

  async refreshSession(refreshToken: string): Promise<Session> {
    const tokenHash = hashToken(refreshToken);
    const record = await this.prisma.refreshToken.findFirst({
      where: { tokenHash, revocado: false },
    });
    if (!record || record.expiraEn < new Date()) {
      throw new UnauthorizedError("Sesión expirada, inicia sesión de nuevo");
    }
    const user = await this.prisma.usuario.findUnique({ where: { id: record.usuarioId } });
    if (!user || !user.activo) {
      throw new UnauthorizedError("Sesión inválida");
    }
    // Rotación: revoca el token usado y emite uno nuevo.
    await this.prisma.refreshToken.update({ where: { id: record.id }, data: { revocado: true } });
    const tokens = await this.issueSession(user);
    return { ...tokens, user: toPublicUser(user) };
  }

  async logout(refreshToken: string | undefined): Promise<void> {
    if (!refreshToken) return;
    const tokenHash = hashToken(refreshToken);
    await this.prisma.refreshToken.updateMany({ where: { tokenHash }, data: { revocado: true } });
  }

  async getMe(userId: string): Promise<PublicUser> {
    const user = await this.prisma.usuario.findUnique({
      where: { id: userId },
      select: { id: true, nombre: true, correo: true, rol: true },
    });
    if (!user) {
      throw new UnauthorizedError();
    }
    return toPublicUser(user);
  }
}
