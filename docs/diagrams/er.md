# Diagrama Entidad-Relación

Namespaces Postgres: `app_auth`, `core`, `notif`. Las FKs cruzan namespaces.

`tipos_addenda` ahora cuelga directo de `empresas` (una empresa define sus propios tipos; único por `[empresa_id, nombre]`). No existe un catálogo separado de "cadenas comerciales": el generador de addenda se resuelve por el nombre de la empresa (ver `generators/registry.ts`).

```mermaid
erDiagram
  usuarios ||--o{ refresh_tokens : "tiene"
  usuarios ||--o{ password_reset_tokens : "solicita"
  usuarios ||--o{ consentimientos : "acepta"
  usuarios ||--o{ addendas : "genera"
  empresas ||--o{ addendas : "para"
  empresas ||--o{ tipos_addenda : "define"
  tipos_addenda ||--o{ addendas : "tipo de"
  addendas ||--|| informacion_xml : "CFDI origen"
  addendas ||--|| respuestas_addenda : "snapshot del formulario (JSONB)"
  addendas ||--o{ notificaciones : "envíos"

  usuarios {
    uuid id PK
    string nombre
    string correo UK
    string password_hash
    enum rol "USER|ADMIN"
    bool activo
  }
  refresh_tokens {
    uuid id PK
    uuid usuario_id FK
    string token_hash
    datetime expira_en
    bool revocado
  }
  password_reset_tokens {
    uuid id PK
    uuid usuario_id FK
    string token_hash
    datetime expira_en
    bool usado
  }
  consentimientos {
    uuid id PK
    uuid usuario_id FK
    enum documento "TERMINOS|PRIVACIDAD|COOKIES"
    string version
    datetime aceptado_en
  }
  empresas {
    uuid id PK
    string nombre
    string rfc UK
    string direccion "nullable"
    string telefono "nullable"
  }
  tipos_addenda {
    uuid id PK
    uuid empresa_id FK
    string nombre
    json configuracion_campos
  }
  addendas {
    uuid id PK
    uuid usuario_id FK
    uuid empresa_id FK
    uuid tipo_addenda_id FK
    enum estado "GENERADA|ENVIADA|ERROR"
    datetime fecha_generacion
    string xml_path "nullable"
    text xml_content "nullable"
  }
  informacion_xml {
    uuid id PK
    uuid addenda_id FK,UK
    string nombre_archivo
    string serie_cfdi "nullable"
    string folio_cfdi "nullable"
    string uuid_cfdi UK,"nullable"
    datetime fecha_cfdi "nullable"
    decimal subtotal "nullable"
    decimal iva "nullable"
    decimal total "nullable"
    string moneda "nullable"
  }
  respuestas_addenda {
    uuid id PK
    uuid addenda_id FK,UK
    json datos_formulario
  }
  notificaciones {
    uuid id PK
    uuid addenda_id FK
    string destinatario
    string asunto
    enum estado "PENDIENTE|ENVIADA|FALLIDA"
    string error "nullable"
    datetime enviada_en "nullable"
  }
```

Nota: `respuestas_addenda.datos_formulario` guarda el snapshot de `datosGlobales` (bolsa clave-valor genérica del formulario dinámico). El detalle de productos/tarimas capturado en el formulario **no** se persiste en tablas normalizadas propias; vive en el XML final (`addendas.xml_content`) y, del lado de la request, en `datosComplementarios` (ver `addendas.schema.ts`).
