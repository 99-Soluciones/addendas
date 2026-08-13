import { Injectable } from "@nestjs/common";
import { BadRequestError, NotFoundError } from "../../utils/http-errors.js";
import { PrismaService } from "../../prisma/prisma.service.js";
import { EmailService } from "../notifications/email.service.js";
import { CfdiParseError, parseCfdi } from "./generators/cfdi.parser.js";
import { getGenerador } from "./generators/registry.js";
import type { CreateAddendaInput } from "./addendas.schema.js";

@Injectable()
export class AddendasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
  ) {}

  async createAddenda(userId: string, input: CreateAddendaInput) {
    const empresa = await this.prisma.empresa.findUnique({
      where: { id: input.empresaId },
    });
    if (!empresa) {
      throw new NotFoundError("Empresa no encontrada");
    }

    // 2. Tipo de addenda + empresa.
    const tipo = await this.prisma.tipoAddenda.findUnique({
      where: { id: input.tipoAddendaId },
      include: { empresa: true },
    });
    if (!tipo) {
      throw new NotFoundError("Tipo de addenda no encontrado");
    }
    if (tipo.empresaId !== input.empresaId) {
      throw new BadRequestError("El tipo de addenda no corresponde a la empresa seleccionada");
    }

    // 3. Parsear el CFDI (fuente de verdad de comprobante/conceptos).
    const datosCFDI = (() => {
      try {
        return parseCfdi(input.cfdiXml);
      } catch (error) {
        if (error instanceof CfdiParseError) throw new BadRequestError(error.message);
        throw error;
      }
    })();

    // 5. Generar la addenda (byte-compatible con el MVP).
    const gen = (() => {
      try {
        return getGenerador(tipo.empresa.nombre);
      } catch {
        throw new BadRequestError(
          `No hay generador de addenda para la empresa "${tipo.empresa.nombre}"`,
        );
      }
    })();
    const buildInput = gen.mapear(datosCFDI, tipo.nombre, input);
    const addendaXml = gen.construir(buildInput);
    const fullXml = gen.unir(input.cfdiXml, addendaXml);

    //

    const comp = datosCFDI.comprobante;
    const created = await this.prisma.$transaction(async (tx) => {
      return tx.addenda.create({
        data: {
          usuarioId: userId,
          empresaId: input.empresaId,
          tipoAddendaId: input.tipoAddendaId,
          estado: "GENERADA",
          xmlContent: fullXml,
          informacionXml: {
            create: {
              nombreArchivo: input.nombreArchivo ?? `${comp.Serie}-${comp.Folio}.xml`,
              serieCfdi: comp.Serie || null,
              folioCfdi: comp.Folio || null,
              fechaCfdi: comp.Fecha ? new Date(comp.Fecha) : null,
              subtotal: comp.SubTotal,
              iva: datosCFDI.impuestos.TasaIVA,
              total: comp.Total || null,
              moneda: comp.Moneda || null,
            },
          },
          respuesta: { create: { datosFormulario: input.datosGlobales } },
        },
      });
    });

    return { id: created.id, xml: fullXml };
  }

  /** Parsea un CFDI y devuelve comprobante + conceptos para que el cliente arme el formulario. */
  previewCfdi(cfdiXml: string) {
    try {
      return parseCfdi(cfdiXml);
    } catch (error) {
      if (error instanceof CfdiParseError) throw new BadRequestError(error.message);
      throw error;
    }
  }

  listAddendas(userId: string) {
    return this.prisma.addenda.findMany({
      where: { usuarioId: userId },
      orderBy: { fechaGeneracion: "desc" },
      select: {
        id: true,
        estado: true,
        fechaGeneracion: true,
        tipoAddenda: { select: { nombre: true } },
        empresa: { select: { nombre: true } },
        informacionXml: { select: { serieCfdi: true, folioCfdi: true } },
      },
    });
  }

  async getAddenda(userId: string, id: string) {
    const addenda = await this.prisma.addenda.findFirst({
      where: { id, usuarioId: userId },
      include: {
        tipoAddenda: { select: { nombre: true } },
        empresa: { select: { nombre: true, rfc: true } },
        informacionXml: true,
        respuesta: true,
      },
    });
    if (!addenda) {
      throw new NotFoundError("Addenda no encontrada");
    }
    return addenda;
  }

  async getAddendaXml(userId: string, id: string) {
    const addenda = await this.prisma.addenda.findFirst({
      where: { id, usuarioId: userId },
      select: { xmlContent: true, informacionXml: { select: { nombreArchivo: true } } },
    });
    if (!addenda?.xmlContent) {
      throw new NotFoundError("Addenda no encontrada");
    }
    return {
      xml: addenda.xmlContent,
      filename: addenda.informacionXml?.nombreArchivo ?? `addenda-${id}.xml`,
    };
  }

  /** Envía la addenda por correo y registra la notificación. */
  async emailAddenda(userId: string, id: string, to: string): Promise<void> {
    const { xml, filename } = await this.getAddendaXml(userId, id);

    const response = await this.email.sendAddenda({
      to,
      asunto: `Addenda ${filename}`,
      cuerpo: "Adjunto encontrarás la addenda generada.",
      xml,
      filename,
    });
    if (response.accepted.includes(to)) {
      await this.markEnviada(userId, id, to);
    } else {
      throw new BadRequestError("No se pudo enviar el correo");
    }
  }

  async markEnviada(userId: string, id: string, destinatario: string): Promise<void> {
    const addenda = await this.prisma.addenda.findFirst({
      where: { id, usuarioId: userId },
      select: { id: true },
    });
    if (!addenda) {
      throw new NotFoundError("Addenda no encontrada");
    }
    await this.prisma.$transaction([
      this.prisma.addenda.update({ where: { id }, data: { estado: "ENVIADA" } }),
      this.prisma.notificacion.create({
        data: {
          addendaId: id,
          destinatario,
          asunto: "Addenda enviada",
          estado: "ENVIADA",
          enviadaEn: new Date(),
        },
      }),
    ]);
  }
}
