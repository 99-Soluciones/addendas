import { Injectable } from "@nestjs/common";
import { NotFoundError } from "../../utils/http-errors.js";
import { PrismaService } from "../../prisma/prisma.service.js";

@Injectable()
export class CatalogosService {
  constructor(private readonly prisma: PrismaService) {}

  listTipos(empresaId?: string) {
    return this.prisma.tipoAddenda.findMany({
      where: { empresaId: empresaId ?? undefined },
      orderBy: { nombre: "asc" },
      select: {
        id: true,
        nombre: true,
        empresaId: true,
        configuracionCampos: true,
        empresa: { select: { nombre: true } },
      },
    });
  }

  async getTipo(id: string) {
    const tipo = await this.prisma.tipoAddenda.findUnique({
      where: { id },
      select: {
        id: true,
        nombre: true,
        configuracionCampos: true,
        empresa: { select: { nombre: true } },
      },
    });
    if (!tipo) {
      throw new NotFoundError("Tipo de addenda no encontrado");
    }
    return tipo;
  }
}
