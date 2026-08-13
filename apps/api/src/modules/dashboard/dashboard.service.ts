import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(userId: string) {
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);

    const [total, esteMes, porEstado, topEmpresa, recientes] = await Promise.all([
      this.prisma.addenda.count({ where: { usuarioId: userId } }),
      this.prisma.addenda.count({
        where: { usuarioId: userId, fechaGeneracion: { gte: inicioMes } },
      }),
      this.prisma.addenda.groupBy({
        by: ["estado"],
        where: { usuarioId: userId },
        _count: { _all: true },
      }),
      // Empresa con mas addendas generadas POR ESTE usuario.
      this.prisma.addenda.groupBy({
        by: ["empresaId"],
        where: { usuarioId: userId },
        _count: { empresaId: true },
        orderBy: { _count: { empresaId: "desc" } },
        take: 1,
      }),
      this.prisma.addenda.findMany({
        where: { usuarioId: userId },
        orderBy: { fechaGeneracion: "desc" },
        take: 5,
        select: {
          id: true,
          estado: true,
          fechaGeneracion: true,
          tipoAddenda: { select: { nombre: true } },
          empresa: { select: { nombre: true } },
          informacionXml: { select: { serieCfdi: true, folioCfdi: true } },
        },
      }),
    ]);

    const empresaMasUso = topEmpresa[0]
      ? ((
          await this.prisma.empresa.findUnique({
            where: { id: topEmpresa[0].empresaId },
            select: { nombre: true },
          })
        )?.nombre ?? null)
      : null;

    return {
      total,
      esteMes,
      empresa_mas_uso: empresaMasUso,
      porEstado: porEstado.map((e) => ({ estado: e.estado, count: e._count._all })),
      recientes: recientes.map((r) => ({
        id: r.id,
        estado: r.estado,
        fecha: r.fechaGeneracion,
        tipo: r.tipoAddenda.nombre,
        empresa: r.empresa.nombre,
        folio: r.informacionXml
          ? `${r.informacionXml.serieCfdi ?? ""}-${r.informacionXml.folioCfdi ?? ""}`
          : null,
      })),
    };
  }
}
