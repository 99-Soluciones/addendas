import { hash, verify } from "@node-rs/argon2";
import { Injectable } from "@nestjs/common";
import { BadRequestError, UnauthorizedError } from "../../utils/http-errors.js";
import { PrismaService } from "../../prisma/prisma.service.js";
import type { UpdateProfileInput } from "./users.schema.js";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /** Listado de usuarios (solo admin), con el conteo de addendas generadas. */
  listUsers() {
    return this.prisma.usuario.findMany({
      select: {
        id: true,
        nombre: true,
        correo: true,
        rol: true,
        activo: true,
        createdAt: true,
        _count: { select: { addendas: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async updateProfile(userId: string, data: UpdateProfileInput) {
    if (data.correo) {
      const existing = await this.prisma.usuario.findUnique({ where: { correo: data.correo } });
      if (existing && existing.id !== userId) {
        throw new BadRequestError("Ese correo ya está en uso");
      }
    }
    return this.prisma.usuario.update({
      where: { id: userId },
      data,
      select: { id: true, nombre: true, correo: true, rol: true },
    });
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.prisma.usuario.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedError();
    }
    const ok = await verify(user.passwordHash, currentPassword);
    if (!ok) {
      throw new BadRequestError("La contraseña actual es incorrecta");
    }
    const passwordHash = await hash(newPassword);
    await this.prisma.usuario.update({ where: { id: userId }, data: { passwordHash } });
    // Invalida sesiones existentes tras el cambio de contraseña.
    await this.prisma.refreshToken.updateMany({
      where: { usuarioId: userId },
      data: { revocado: true },
    });
  }
}
