-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "app_auth";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "core";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "notif";

-- CreateEnum
CREATE TYPE "app_auth"."Rol" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "core"."EstadoAddenda" AS ENUM ('GENERADA', 'ENVIADA', 'ERROR');

-- CreateEnum
CREATE TYPE "notif"."EstadoNotificacion" AS ENUM ('PENDIENTE', 'ENVIADA', 'FALLIDA');

-- CreateTable
CREATE TABLE "app_auth"."usuarios" (
    "id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "rol" "app_auth"."Rol" NOT NULL DEFAULT 'USER',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_auth"."refresh_tokens" (
    "id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expira_en" TIMESTAMP(3) NOT NULL,
    "revocado" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core"."empresas" (
    "id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "rfc" TEXT NOT NULL,
    "direccion" TEXT,
    "telefono" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "empresas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core"."usuario_empresas" (
    "usuario_id" UUID NOT NULL,
    "empresa_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuario_empresas_pkey" PRIMARY KEY ("usuario_id","empresa_id")
);

-- CreateTable
CREATE TABLE "core"."cadenas_comerciales" (
    "id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cadenas_comerciales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core"."tipos_addenda" (
    "id" UUID NOT NULL,
    "cadena_id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "configuracion_campos" JSONB NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tipos_addenda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core"."addendas" (
    "id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "empresa_id" UUID NOT NULL,
    "tipo_addenda_id" UUID NOT NULL,
    "estado" "core"."EstadoAddenda" NOT NULL DEFAULT 'GENERADA',
    "fecha_generacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "xml_path" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "addendas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core"."informacion_xml" (
    "id" UUID NOT NULL,
    "addenda_id" UUID NOT NULL,
    "nombre_archivo" TEXT NOT NULL,
    "serie_cfdi" TEXT,
    "folio_cfdi" TEXT,
    "uuid_cfdi" TEXT,
    "fecha_cfdi" TIMESTAMP(3),
    "subtotal" DECIMAL(18,6),
    "iva" DECIMAL(18,2),
    "total" DECIMAL(18,6),
    "moneda" TEXT,
    "fecha_subida" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "informacion_xml_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core"."respuestas_addenda" (
    "id" UUID NOT NULL,
    "addenda_id" UUID NOT NULL,
    "datos_formulario" JSONB NOT NULL,
    "fecha_respuesta" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "respuestas_addenda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core"."addenda_articulos" (
    "id" UUID NOT NULL,
    "addenda_id" UUID NOT NULL,
    "codigo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "cantidad" DECIMAL(18,2) NOT NULL,
    "valor_unitario" DECIMAL(18,6) NOT NULL,
    "importe" DECIMAL(18,6) NOT NULL,
    "porcentaje_iva" DECIMAL(5,2) NOT NULL,
    "row_order" INTEGER NOT NULL,

    CONSTRAINT "addenda_articulos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core"."addenda_tarimas" (
    "id" UUID NOT NULL,
    "addenda_id" UUID NOT NULL,
    "numero" INTEGER NOT NULL,
    "codigo_barra" TEXT NOT NULL,
    "row_order" INTEGER NOT NULL,

    CONSTRAINT "addenda_tarimas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core"."addenda_articulo_tarima" (
    "addenda_id" UUID NOT NULL,
    "articulo_id" UUID NOT NULL,
    "tarima_id" UUID NOT NULL,

    CONSTRAINT "addenda_articulo_tarima_pkey" PRIMARY KEY ("articulo_id","tarima_id")
);

-- CreateTable
CREATE TABLE "notif"."notificaciones" (
    "id" UUID NOT NULL,
    "addenda_id" UUID NOT NULL,
    "destinatario" TEXT NOT NULL,
    "asunto" TEXT NOT NULL,
    "estado" "notif"."EstadoNotificacion" NOT NULL DEFAULT 'PENDIENTE',
    "error" TEXT,
    "enviada_en" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notificaciones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_correo_key" ON "app_auth"."usuarios"("correo");

-- CreateIndex
CREATE INDEX "refresh_tokens_usuario_id_idx" ON "app_auth"."refresh_tokens"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "empresas_rfc_key" ON "core"."empresas"("rfc");

-- CreateIndex
CREATE INDEX "usuario_empresas_empresa_id_idx" ON "core"."usuario_empresas"("empresa_id");

-- CreateIndex
CREATE UNIQUE INDEX "cadenas_comerciales_nombre_key" ON "core"."cadenas_comerciales"("nombre");

-- CreateIndex
CREATE INDEX "tipos_addenda_cadena_id_idx" ON "core"."tipos_addenda"("cadena_id");

-- CreateIndex
CREATE UNIQUE INDEX "tipos_addenda_cadena_id_nombre_key" ON "core"."tipos_addenda"("cadena_id", "nombre");

-- CreateIndex
CREATE INDEX "addendas_usuario_id_idx" ON "core"."addendas"("usuario_id");

-- CreateIndex
CREATE INDEX "addendas_empresa_id_idx" ON "core"."addendas"("empresa_id");

-- CreateIndex
CREATE INDEX "addendas_tipo_addenda_id_idx" ON "core"."addendas"("tipo_addenda_id");

-- CreateIndex
CREATE INDEX "addendas_estado_idx" ON "core"."addendas"("estado");

-- CreateIndex
CREATE INDEX "addendas_fecha_generacion_idx" ON "core"."addendas"("fecha_generacion" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "informacion_xml_addenda_id_key" ON "core"."informacion_xml"("addenda_id");

-- CreateIndex
CREATE UNIQUE INDEX "informacion_xml_uuid_cfdi_key" ON "core"."informacion_xml"("uuid_cfdi");

-- CreateIndex
CREATE INDEX "informacion_xml_serie_cfdi_folio_cfdi_idx" ON "core"."informacion_xml"("serie_cfdi", "folio_cfdi");

-- CreateIndex
CREATE UNIQUE INDEX "respuestas_addenda_addenda_id_key" ON "core"."respuestas_addenda"("addenda_id");

-- CreateIndex
CREATE INDEX "addenda_articulos_addenda_id_idx" ON "core"."addenda_articulos"("addenda_id");

-- CreateIndex
CREATE INDEX "addenda_tarimas_addenda_id_idx" ON "core"."addenda_tarimas"("addenda_id");

-- CreateIndex
CREATE INDEX "addenda_articulo_tarima_addenda_id_idx" ON "core"."addenda_articulo_tarima"("addenda_id");

-- CreateIndex
CREATE INDEX "addenda_articulo_tarima_tarima_id_idx" ON "core"."addenda_articulo_tarima"("tarima_id");

-- CreateIndex
CREATE INDEX "notificaciones_addenda_id_idx" ON "notif"."notificaciones"("addenda_id");

-- AddForeignKey
ALTER TABLE "app_auth"."refresh_tokens" ADD CONSTRAINT "refresh_tokens_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "app_auth"."usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."usuario_empresas" ADD CONSTRAINT "usuario_empresas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "app_auth"."usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."usuario_empresas" ADD CONSTRAINT "usuario_empresas_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "core"."empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."tipos_addenda" ADD CONSTRAINT "tipos_addenda_cadena_id_fkey" FOREIGN KEY ("cadena_id") REFERENCES "core"."cadenas_comerciales"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."addendas" ADD CONSTRAINT "addendas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "app_auth"."usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."addendas" ADD CONSTRAINT "addendas_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "core"."empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."addendas" ADD CONSTRAINT "addendas_tipo_addenda_id_fkey" FOREIGN KEY ("tipo_addenda_id") REFERENCES "core"."tipos_addenda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."informacion_xml" ADD CONSTRAINT "informacion_xml_addenda_id_fkey" FOREIGN KEY ("addenda_id") REFERENCES "core"."addendas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."respuestas_addenda" ADD CONSTRAINT "respuestas_addenda_addenda_id_fkey" FOREIGN KEY ("addenda_id") REFERENCES "core"."addendas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."addenda_articulos" ADD CONSTRAINT "addenda_articulos_addenda_id_fkey" FOREIGN KEY ("addenda_id") REFERENCES "core"."addendas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."addenda_tarimas" ADD CONSTRAINT "addenda_tarimas_addenda_id_fkey" FOREIGN KEY ("addenda_id") REFERENCES "core"."addendas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."addenda_articulo_tarima" ADD CONSTRAINT "addenda_articulo_tarima_addenda_id_fkey" FOREIGN KEY ("addenda_id") REFERENCES "core"."addendas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."addenda_articulo_tarima" ADD CONSTRAINT "addenda_articulo_tarima_articulo_id_fkey" FOREIGN KEY ("articulo_id") REFERENCES "core"."addenda_articulos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."addenda_articulo_tarima" ADD CONSTRAINT "addenda_articulo_tarima_tarima_id_fkey" FOREIGN KEY ("tarima_id") REFERENCES "core"."addenda_tarimas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notif"."notificaciones" ADD CONSTRAINT "notificaciones_addenda_id_fkey" FOREIGN KEY ("addenda_id") REFERENCES "core"."addendas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================================
--  Trigger: mantener updated_at automáticamente (a nivel DB,
--  además del @updatedAt de Prisma) en las tablas que lo tienen.
-- ============================================================
CREATE OR REPLACE FUNCTION "core"."set_updated_at"()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updated_at" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "trg_usuarios_updated_at"
  BEFORE UPDATE ON "app_auth"."usuarios"
  FOR EACH ROW EXECUTE FUNCTION "core"."set_updated_at"();

CREATE TRIGGER "trg_empresas_updated_at"
  BEFORE UPDATE ON "core"."empresas"
  FOR EACH ROW EXECUTE FUNCTION "core"."set_updated_at"();

CREATE TRIGGER "trg_cadenas_comerciales_updated_at"
  BEFORE UPDATE ON "core"."cadenas_comerciales"
  FOR EACH ROW EXECUTE FUNCTION "core"."set_updated_at"();

CREATE TRIGGER "trg_tipos_addenda_updated_at"
  BEFORE UPDATE ON "core"."tipos_addenda"
  FOR EACH ROW EXECUTE FUNCTION "core"."set_updated_at"();

CREATE TRIGGER "trg_addendas_updated_at"
  BEFORE UPDATE ON "core"."addendas"
  FOR EACH ROW EXECUTE FUNCTION "core"."set_updated_at"();
