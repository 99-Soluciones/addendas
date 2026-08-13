import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";

@Injectable()
export class EmpresasService {
  constructor(private readonly prisma: PrismaService) {}

  /** Empresas registradas en el sistema. */
  async list() {
    const empresas = await this.prisma.empresa.findMany({
      select: { id: true, nombre: true, rfc: true },
      orderBy: { nombre: "asc" },
    });
    return empresas;
  }
}
