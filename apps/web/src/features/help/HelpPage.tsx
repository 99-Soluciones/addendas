import { Card, PageTitle } from "../../shared/components/ui/Card";

export function HelpPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageTitle title="Ayuda" subtitle="Cadenas comerciales y documentación" />
      <Card>
        <h3 className="text-sm font-semibold">Soriana</h3>
        <p className="mt-2 text-sm text-muted">
          Addenda con estructura DSCargaRemisionProv. Dos tipos:
        </p>
        <ul className="mt-2 list-inside list-disc text-sm text-muted">
          <li>
            <span className="text-ink">Consolidada</span>: incluye número de cita, tarimas (código
            SSCC) y asignación de productos por tarima.
          </li>
          <li>
            <span className="text-ink">Extemporanea</span>: incluye folio de nota de entrada, sin
            tarimas.
          </li>
        </ul>
        <br />
        <h3 className="text-sm font-semibold">Cómo generar una addenda</h3>
        <ol className="mt-2 list-inside list-decimal space-y-2 text-sm text-muted">
          <li>
            En <span className="text-ink">Nueva addenda</span>, selecciona la{" "}
            <span className="text-ink">empresa</span> y el{" "}
            <span className="text-ink">tipo de addenda</span> (Consolidada o Extemporanea).
          </li>
          <li>
            Sube el <span className="text-ink">XML del CFDI 4.0</span> ya timbrado. El sistema lee
            el comprobante y muestra sus conceptos.
          </li>
          <li>
            Completa los <span className="text-ink">datos globales</span> (número de cita, folio,
            etc. según el tipo elegido) y asigna un <span className="text-ink">código</span>{" "}
            (SKU/EAN) a cada producto.
          </li>
          <li>
            Si es Consolidada, agrega las <span className="text-ink">tarimas</span> (código de
            barras SSCC) y asigna cada producto a su tarima.
          </li>
          <li>
            Da clic en <span className="text-ink">Generar addenda</span>. Cuando termine, puedes{" "}
            <span className="text-ink">descargar el XML</span> o{" "}
            <span className="text-ink">enviarlo por correo</span> directamente.
          </li>
        </ol>
        <p className="mt-3 text-xs text-muted">
          Usa <span className="text-ink">Resetear</span> en cualquier momento para empezar de nuevo
          con otro archivo.
        </p>
        <p className="mt-4 text-xs text-muted">
          La documentación detallada de Soriana la puede revisar en el siguiente enlace:
          <br />
          <a
            className="break-all text-accent"
            href="https://www.organizacionsoriana.com/pdf/guia_implementacion/ManualFacturacionElectronicaPERSONALADMINISTRATIVO1.pdf"
            target="_blank"
            rel="noopener noreferrer"
          >
            https://www.organizacionsoriana.com/pdf/guia_implementacion/ManualFacturacionElectronicaPERSONALADMINISTRATIVO1.pdf
          </a>
        </p>
      </Card>
    </div>
  );
}
