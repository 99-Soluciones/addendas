import type { LegalDocId } from "@addendex/shared";

// Contenido de los documentos legales, transcrito de docs/legal/*.docx.
// La metadata (titulo, version, fecha) vive en @addenda/shared (LEGAL_DOCS).

export type LegalBlock =
  | { kind: "h2"; text: string }
  | { kind: "h3"; text: string }
  | { kind: "p"; text: string }
  | { kind: "list"; items: string[] };

export interface LegalDocContent {
  intro?: string;
  blocks: LegalBlock[];
}

const terminos: LegalDocContent = {
  blocks: [
    { kind: "h2", text: "1. Aceptación de los Términos" },
    {
      kind: "p",
      text: "Al acceder o utilizar la plataforma Addendex (en adelante, la Plataforma), usted acepta quedar vinculado por los presentes Términos y Condiciones de Uso (en adelante, los Términos). Si no está de acuerdo con alguno de ellos, le pedimos que se abstenga de utilizar la Plataforma.",
    },
    {
      kind: "p",
      text: "Estos Términos constituyen un acuerdo legal entre usted (persona física o moral, en adelante el Usuario) y 99 REMEDIOS S.A. de C.V. (en adelante, el Titular), con domicilio para efectos legales en los Estados Unidos Mexicanos.",
    },
    { kind: "h2", text: "2. Descripción del Servicio" },
    {
      kind: "p",
      text: "Addendex es una plataforma web que permite la generación de addenda en formato XML para Comprobantes Fiscales Digitales por Internet versión 4.0 (CFDI 4.0), conforme a los requerimientos específicos de distintos clientes o cadenas comerciales que operan en México.",
    },
    {
      kind: "p",
      text: "El servicio se limita exclusivamente a la generación del documento XML de addenda. La Plataforma:",
    },
    {
      kind: "list",
      items: [
        "No valida, certifica ni timbra ningún CFDI.",
        "No actúa como Proveedor Autorizado de Certificación (PAC).",
        "No asesora en materia fiscal ni contable.",
        "No garantiza la aceptación del documento generado por el receptor o por cualquier sistema externo.",
      ],
    },
    {
      kind: "p",
      text: "La responsabilidad de validar la estructura fiscal, el timbrado y la aceptación del CFDI recae exclusivamente en el Usuario y en los sistemas que este contrate para tales efectos.",
    },
    { kind: "h2", text: "3. Registro y Cuenta de Usuario" },
    {
      kind: "p",
      text: "Para utilizar la Plataforma, el Usuario deberá crear una cuenta proporcionando información verídica, completa y actualizada. El Usuario es responsable de mantener la confidencialidad de sus credenciales de acceso y de todas las actividades que se realicen bajo su cuenta.",
    },
    {
      kind: "p",
      text: "El Titular se reserva el derecho de suspender o cancelar cuentas que incumplan los presentes Términos, utilicen información falsa o realicen un uso indebido de la Plataforma.",
    },
    { kind: "h2", text: "4. Uso Permitido y Restricciones" },
    {
      kind: "p",
      text: "El Usuario se compromete a utilizar la Plataforma de manera lícita y conforme a estos Términos. Queda expresamente prohibido:",
    },
    {
      kind: "list",
      items: [
        "Utilizar la Plataforma para generar documentos con datos falsos, apócrifos o con propósito de fraude fiscal.",
        "Intentar acceder, alterar o dañar los sistemas, servidores o bases de datos de la Plataforma.",
        "Realizar ingeniería inversa, descompilar o extraer el código fuente de la Plataforma.",
        "Ceder, sublicenciar o transferir el acceso a la Plataforma a terceros sin autorización expresa.",
        "Realizar cualquier acción que pueda sobrecargar o degradar el funcionamiento de la Plataforma.",
      ],
    },
    { kind: "h2", text: "5. Datos del CFDI y Responsabilidad del Usuario" },
    {
      kind: "p",
      text: "Los datos ingresados en la Plataforma para la generación de la addenda son responsabilidad exclusiva del Usuario. El Titular no verifica la veracidad, exactitud o legalidad de dicha información.",
    },
    {
      kind: "p",
      text: "El Usuario declara y garantiza que cuenta con las autorizaciones necesarias para utilizar los datos de terceros que ingrese en la Plataforma, en particular datos de clientes, proveedores o socios comerciales.",
    },
    { kind: "h2", text: "6. Propiedad Intelectual" },
    {
      kind: "p",
      text: "Todos los derechos de propiedad intelectual sobre la Plataforma, su código fuente, diseño, logotipos, marcas, documentación y contenido son propiedad del Titular o de sus licenciantes. Ninguna disposición de los presentes Términos otorga al Usuario ningún derecho sobre dichos elementos, salvo la licencia limitada de uso descrita en estos Términos.",
    },
    {
      kind: "p",
      text: "El XML generado a partir de los datos proporcionados por el Usuario es propiedad del Usuario, sin perjuicio de los derechos del Titular sobre la Plataforma misma.",
    },
    { kind: "h2", text: "7. Disponibilidad del Servicio" },
    {
      kind: "p",
      text: "El Titular realizará sus mejores esfuerzos para mantener la Plataforma disponible de manera continua; sin embargo, no garantiza una disponibilidad ininterrumpida. La Plataforma podrá estar temporalmente fuera de servicio por mantenimiento, actualizaciones o causas de fuerza mayor, sin que ello genere responsabilidad alguna para el Titular.",
    },
    { kind: "h2", text: "8. Limitación de Responsabilidad" },
    {
      kind: "p",
      text: "En la medida máxima permitida por la legislación mexicana aplicable, el Titular no será responsable por:",
    },
    {
      kind: "list",
      items: [
        "Pérdidas económicas, fiscales o comerciales derivadas del uso o imposibilidad de uso de la Plataforma.",
        "Errores en el XML generado atribuibles a datos incorrectos proporcionados por el Usuario.",
        "Rechazo del documento por parte del receptor, el SAT o cualquier sistema externo.",
        "Daños indirectos, incidentales, especiales o consecuentes.",
      ],
    },
    {
      kind: "p",
      text: "La responsabilidad total del Titular, en caso de ser declarada procedente, no excederá en ningún caso el monto efectivamente pagado por el Usuario en los doce meses previos al evento que origine la reclamación, o $0.00 MXN en caso de que el servicio sea gratuito.",
    },
    { kind: "h2", text: "9. Modificaciones a los Términos" },
    {
      kind: "p",
      text: "El Titular se reserva el derecho de modificar los presentes Términos en cualquier momento. Las modificaciones entrarán en vigor a partir de su publicación en la Plataforma. El uso continuado de la Plataforma tras la publicación de cambios constituirá la aceptación de los Términos modificados. El Titular notificará cambios sustanciales al correo electrónico registrado por el Usuario.",
    },
    { kind: "h2", text: "10. Vigencia y Terminación" },
    {
      kind: "p",
      text: "Los presentes Términos tienen vigencia indefinida mientras el Usuario mantenga una cuenta activa en la Plataforma. El Usuario podrá dar por terminado el acuerdo eliminando su cuenta. El Titular podrá suspender o cancelar el acceso del Usuario en caso de incumplimiento de estos Términos, sin necesidad de notificación previa.",
    },
    { kind: "h2", text: "11. Legislación Aplicable y Jurisdicción" },
    {
      kind: "p",
      text: "Los presentes Términos se rigen e interpretan de conformidad con las leyes vigentes en los Estados Unidos Mexicanos. Para la resolución de cualquier controversia, las partes se someten a la jurisdicción de los tribunales competentes de la Ciudad de México, renunciando expresamente a cualquier otro fuero que pudiera corresponderles.",
    },
    { kind: "h2", text: "12. Contacto" },
    {
      kind: "p",
      text: "Para cualquier duda o aclaración respecto a los presentes Términos, el Usuario puede comunicarse con el Titular a través del correo electrónico: contact@builtbysori.me.",
    },
  ],
};

const privacidad: LegalDocContent = {
  intro:
    "En cumplimiento a lo dispuesto por la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) y su Reglamento, 99 REMEDIOS S.A. de C.V. (en adelante, el Responsable), pone a su disposición el presente Aviso de Privacidad.",
  blocks: [
    { kind: "h2", text: "1. Identidad y Domicilio del Responsable" },
    {
      kind: "list",
      items: [
        "Nombre: 99 REMEDIOS S.A. de C.V.",
        "Plataforma: Addendex",
        "País: Estados Unidos Mexicanos",
        "Correo de contacto: contact@builtbysori.me",
      ],
    },
    { kind: "h2", text: "2. Datos Personales que se Recaban" },
    { kind: "p", text: "El Responsable recaba las siguientes categorías de datos personales:" },
    { kind: "h3", text: "2.1 Datos de identificación y contacto" },
    {
      kind: "list",
      items: ["Nombre completo", "Dirección de correo electrónico", "Nombre de usuario"],
    },
    { kind: "h3", text: "2.2 Datos contenidos en los CFDI ingresados por el Usuario" },
    {
      kind: "p",
      text: "Con el propósito de generar la addenda solicitada, el Usuario ingresa información que puede incluir:",
    },
    {
      kind: "list",
      items: [
        "RFC del emisor y del receptor",
        "Razón social o nombre del emisor y receptor",
        "Domicilio fiscal",
        "Descripción, cantidad y valor de bienes o servicios",
        "Datos específicos requeridos por la addenda (números de orden, claves de proveedor, números de entrega, etc.)",
      ],
    },
    {
      kind: "p",
      text: "Estos datos son procesados únicamente para generar el XML de addenda solicitado y no son utilizados para ningún otro fin.",
    },
    { kind: "h3", text: "2.3 Firma digital" },
    {
      kind: "p",
      text: "En los casos en que la addenda lo requiera, el Usuario puede proporcionar información relacionada con su firma electrónica. Dicha información se procesa en tiempo real y no se almacena de manera permanente en el sistema.",
    },
    { kind: "h3", text: "2.4 Datos sensibles" },
    {
      kind: "p",
      text: "El Responsable NO recaba datos personales sensibles en los términos del artículo 3, fracción VI, de la LFPDPPP (origen racial o étnico, estado de salud, información genética, creencias religiosas, afiliación sindical, opiniones políticas, preferencia sexual).",
    },
    { kind: "h2", text: "3. Finalidades del Tratamiento" },
    { kind: "h3", text: "3.1 Finalidades primarias (necesarias para el servicio)" },
    {
      kind: "list",
      items: [
        "Creación y gestión de la cuenta del Usuario en la Plataforma.",
        "Generación del documento XML de addenda para CFDI 4.0 con los datos proporcionados.",
        "Comunicación con el Usuario sobre su cuenta, actualizaciones del servicio o incidencias técnicas.",
      ],
    },
    { kind: "h3", text: "3.2 Finalidades secundarias" },
    {
      kind: "p",
      text: "El Responsable no utiliza sus datos personales para fines secundarios tales como mercadotecnia, publicidad o prospección comercial. En caso de que en el futuro se pretendan utilizar los datos para finalidades distintas a las primarias, se actualizará el presente Aviso y se recabará el consentimiento del Titular cuando la legislación así lo exija.",
    },
    { kind: "h2", text: "4. Transferencia de Datos Personales" },
    {
      kind: "p",
      text: "Sus datos personales son almacenados en los servidores de Supabase, Inc., proveedor de infraestructura de base de datos cuyas instalaciones se ubican en los Estados Unidos de América. Esta transferencia es necesaria para la operación de la Plataforma.",
    },
    {
      kind: "p",
      text: "Dicha transferencia se realiza con fundamento en el artículo 37 de la LFPDPPP, dado que Supabase actúa como encargado del tratamiento bajo instrucciones del Responsable y sujeto a obligaciones de confidencialidad y seguridad equivalentes a las previstas en la legislación mexicana.",
    },
    {
      kind: "p",
      text: "El Responsable no transfiere ni comercializa sus datos personales con terceros distintos al proveedor de infraestructura mencionado, salvo mandato judicial o administrativo, u obligación legal aplicable.",
    },
    { kind: "h2", text: "5. Derechos ARCO" },
    { kind: "p", text: "Como Titular de los datos personales, usted tiene derecho a:" },
    {
      kind: "list",
      items: [
        "Acceso: conocer qué datos personales tenemos sobre usted, para qué los utilizamos y las condiciones del uso.",
        "Rectificación: solicitar la corrección de sus datos si son inexactos o incompletos.",
        "Cancelación: solicitar la eliminación de sus datos de nuestros sistemas, salvo que exista obligación legal de conservarlos.",
        "Oposición: oponerse al tratamiento de sus datos para finalidades específicas.",
      ],
    },
    {
      kind: "p",
      text: "Para ejercer cualquiera de estos derechos, el Titular deberá enviar una solicitud al correo contact@builtbysori.me con los siguientes elementos:",
    },
    {
      kind: "list",
      items: [
        "Nombre completo y dirección de correo electrónico registrada.",
        "Descripción clara del derecho ARCO que desea ejercer.",
        "Copia de un documento de identificación oficial.",
      ],
    },
    {
      kind: "p",
      text: "El Responsable responderá en un plazo máximo de 20 días hábiles contados a partir de la recepción de la solicitud, en los términos previstos por la LFPDPPP.",
    },
    { kind: "h2", text: "6. Mecanismo para Revocar el Consentimiento" },
    {
      kind: "p",
      text: "El Titular puede revocar el consentimiento otorgado para el tratamiento de sus datos personales en cualquier momento, enviando una solicitud al correo contact@builtbysori.me. La revocación del consentimiento no tendrá efectos retroactivos y puede implicar la imposibilidad de continuar prestando el servicio.",
    },
    { kind: "h2", text: "7. Seguridad de los Datos" },
    {
      kind: "p",
      text: "El Responsable implementa medidas de seguridad técnicas, administrativas y físicas razonables para proteger los datos personales contra pérdida, robo, uso indebido o acceso no autorizado. Entre dichas medidas se incluyen: cifrado de comunicaciones mediante HTTPS/TLS, control de acceso basado en roles, y las medidas de seguridad provistas por Supabase en sus instalaciones.",
    },
    {
      kind: "p",
      text: "En caso de una vulneración de seguridad que afecte significativamente sus derechos, el Responsable le notificará de inmediato por correo electrónico.",
    },
    { kind: "h2", text: "8. Menores de Edad" },
    {
      kind: "p",
      text: "La Plataforma no está dirigida a menores de 18 años. El Responsable no recaba datos de menores de manera intencional. Si usted tiene conocimiento de que un menor ha proporcionado datos personales a través de la Plataforma, le solicita que nos lo notifique al correo contact@builtbysori.me para proceder a su eliminación.",
    },
    { kind: "h2", text: "9. Cambios al Aviso de Privacidad" },
    {
      kind: "p",
      text: "El presente Aviso de Privacidad puede ser modificado en cualquier momento. Las modificaciones se publicarán en la Plataforma y, cuando sean sustanciales, se notificarán al correo electrónico registrado por el Usuario.",
    },
    { kind: "h2", text: "10. Autoridad Competente" },
    {
      kind: "p",
      text: "Si usted considera que su derecho a la protección de datos personales ha sido vulnerado, puede acudir al Instituto Nacional de Transparencia, Acceso a la Información y Protección de Datos Personales (INAI): www.inai.org.mx.",
    },
  ],
};

const cookies: LegalDocContent = {
  blocks: [
    { kind: "h2", text: "1. ¿Qué son las cookies?" },
    {
      kind: "p",
      text: "Las cookies son pequeños archivos de texto que se almacenan en el dispositivo del Usuario cuando accede a un sitio web. Permiten que la Plataforma reconozca al navegador del Usuario en visitas posteriores y recuerde determinadas preferencias o estados de sesión.",
    },
    { kind: "h2", text: "2. Tipos de Cookies que Utiliza la Plataforma" },
    {
      kind: "p",
      text: "Addendex utiliza exclusivamente cookies técnicas o estrictamente necesarias para el funcionamiento de la Plataforma. No se utilizan cookies de análisis, publicidad, perfilado ni rastreo de terceros.",
    },
    { kind: "h3", text: "2.1 Cookies técnicas o de sesión (estrictamente necesarias)" },
    {
      kind: "p",
      text: "Estas cookies son indispensables para que la Plataforma funcione correctamente. Sin ellas, el servicio no puede prestarse. Su uso no requiere el consentimiento del Usuario conforme a la normatividad aplicable.",
    },
    { kind: "p", text: "Las cookies técnicas que utiliza la Plataforma incluyen:" },
    {
      kind: "list",
      items: [
        "Cookie de sesión de autenticación: almacena el token de sesión que permite mantener al Usuario autenticado mientras navega por la Plataforma. Se elimina al cerrar el navegador o al cerrar sesión.",
        "Cookie de preferencias de interfaz: guarda configuraciones básicas del Usuario dentro de la sesión (por ejemplo, tipo de addenda seleccionada).",
      ],
    },
    {
      kind: "p",
      text: "Estas cookies son gestionadas directamente por la Plataforma a través de Supabase, proveedor de infraestructura con servidores en Estados Unidos de América.",
    },
    { kind: "h2", text: "3. Cookies de Terceros" },
    {
      kind: "p",
      text: "La Plataforma NO instala cookies de terceros para fines de análisis, publicidad, redes sociales ni rastreo. No se integran herramientas de analítica web (Google Analytics, Mixpanel u otras) ni píxeles de publicidad.",
    },
    { kind: "h2", text: "4. Duración de las Cookies" },
    {
      kind: "p",
      text: "Las cookies utilizadas por la Plataforma son cookies de sesión: se eliminan automáticamente cuando el Usuario cierra su navegador o cierra sesión en la Plataforma. No se utilizan cookies persistentes de largo plazo.",
    },
    { kind: "h2", text: "5. Gestión y Control de Cookies" },
    {
      kind: "p",
      text: "Dado que la Plataforma únicamente utiliza cookies técnicas, el bloqueo de estas cookies a través del navegador impedirá el correcto funcionamiento del servicio de autenticación y la Plataforma no podrá operar.",
    },
    {
      kind: "p",
      text: "No obstante, el Usuario puede gestionar o eliminar las cookies en cualquier momento desde la configuración de su navegador:",
    },
    {
      kind: "list",
      items: [
        "Google Chrome: Configuración > Privacidad y seguridad > Cookies y otros datos de sitios.",
        "Mozilla Firefox: Opciones > Privacidad y seguridad > Cookies y datos del sitio.",
        "Microsoft Edge: Configuración > Privacidad, búsqueda y servicios > Cookies y permisos del sitio.",
        "Safari: Preferencias > Privacidad > Cookies y datos de sitios web.",
      ],
    },
    { kind: "h2", text: "6. Modificaciones a la Política de Cookies" },
    {
      kind: "p",
      text: "Esta Política de Cookies puede actualizarse en caso de que la Plataforma incorpore nuevas funcionalidades que requieran cookies adicionales. La fecha de última actualización se indica en el encabezado de este documento.",
    },
    { kind: "h2", text: "7. Contacto" },
    {
      kind: "p",
      text: "Para cualquier consulta relacionada con el uso de cookies en la Plataforma, el Usuario puede contactar al Titular a través del correo electrónico: contact@builtbysori.me.",
    },
  ],
};

export const LEGAL_CONTENT: Record<LegalDocId, LegalDocContent> = {
  terminos,
  privacidad,
  cookies,
};

export const LEGAL_COPYRIGHT =
  "© 2026 99 REMEDIOS S.A. de C.V. - Addendex. Todos los derechos reservados.";
