# Diagrama de clases (dominio de generación de addendas)

Estructura por módulos del backend (servicios `@Injectable` de NestJS) y el núcleo de generación (parser + generadores por empresa). Los generadores no son clases: son funciones agrupadas que implementan la interfaz `AddendaGeneratorFunctions`; se modelan aquí como "clases" solo para mostrar su contrato.

```mermaid
classDiagram
  class AddendasService {
    +createAddenda(userId, input) Result
    +previewCfdi(xml) CfdiData
    +listAddendas(userId) Addenda[]
    +getAddenda(userId, id) Addenda
    +getAddendaXml(userId, id) FileResult
    +emailAddenda(userId, id, to) void
    +markEnviada(userId, id, destinatario) void
  }
  class EmpresasService {
    +list() Empresa[]
  }
  class CatalogosService {
    +listTipos(empresaId?) TipoAddenda[]
    +getTipo(id) TipoAddenda
  }
  class CfdiParserModule {
    <<module>>
    +parseCfdi(xml) CfdiData
  }
  class AddendaGeneratorFunctions {
    <<interface>>
    +mapear(datosCFDI, tipoNombre, input) unknown
    +construir(buildInput) string
    +unir(cfdiXml, addendaXml) string
  }
  class SorianaGenerator {
    +mapear = mapearXML
    +construir = construirAddendaSoriana
    +unir = unirAddendaSoriana
  }
  class SorianaBuilderModule {
    <<module>>
    +mapearXML(datosCFDI, tipoNombre, input) BuildAddendaInput
    +construirAddendaSoriana(input) string
    +unirAddendaSoriana(cfdiXml, addendaXml) string
    +esConsolidada(tipoNombre) boolean
  }
  class Registry {
    <<module>>
    +getGenerador(empresaNombre) AddendaGeneratorFunctions
  }
  class EmailService {
    +isConfigured() boolean
    +sendAddenda(args) SentMessageInfo
    +sendPasswordReset(args) SentMessageInfo
  }
  class CfdiData {
    +CfdiComprobante comprobante
    +CfdiImpuestos impuestos
    +CfdiConcepto[] conceptos
  }
  class CfdiConcepto {
    +int index
    +string Descripcion
    +string Cantidad
    +string ValorUnitario
    +string Importe
    +string TasaIVA
  }
  class DatosGlobales {
    +string proveedor
    +string tienda
    +string entrega
    +string cita
    +string folioNotaEntrada
    +string numeroBultos
    +string folioPedido
    +string fechaEntrega
    +string tipoMoneda
    +string tipoBulto
  }
  class BuildAddendaInput {
    +CfdiData datosCFDI
    +DatosGlobales datosGlobales
    +TarimaInput[] tarimas
    +ProductoConCodigo[] productos
    +boolean isConsolidada
  }

  AddendasService --> EmpresasService : valida empresa
  AddendasService --> CatalogosService : valida tipo
  AddendasService --> CfdiParserModule : usa
  AddendasService --> Registry : resuelve por empresa.nombre
  Registry --> SorianaGenerator : provee
  SorianaGenerator ..|> AddendaGeneratorFunctions : implementa
  SorianaGenerator --> SorianaBuilderModule : delega
  SorianaBuilderModule --> BuildAddendaInput : produce/recibe
  AddendasService --> EmailService : envía
  CfdiParserModule --> CfdiData : produce
  CfdiData *-- CfdiConcepto
  BuildAddendaInput *-- CfdiData
  BuildAddendaInput *-- DatosGlobales
```
