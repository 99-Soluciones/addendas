-- Empresa pasa a catalogo global: se elimina la relacion usuario<->empresa,
-- se elimina CadenaComercial y los tipos_addenda cuelgan de Empresa.
-- (Consolida las migraciones addendasaas + v1 + tipo_addenda_empresa_nombre_unique.)

-- Eliminar el puente N:M usuario<->empresa
ALTER TABLE "core"."usuario_empresas" DROP CONSTRAINT "usuario_empresas_empresa_id_fkey";
ALTER TABLE "core"."usuario_empresas" DROP CONSTRAINT "usuario_empresas_usuario_id_fkey";
DROP TABLE "core"."usuario_empresas";

-- tipos_addenda: cadena_id -> empresa_id, quitar activo
ALTER TABLE "core"."tipos_addenda" DROP CONSTRAINT "tipos_addenda_cadena_id_fkey";
DROP INDEX "core"."tipos_addenda_cadena_id_idx";
DROP INDEX "core"."tipos_addenda_cadena_id_nombre_key";
ALTER TABLE "core"."tipos_addenda" DROP COLUMN "activo",
DROP COLUMN "cadena_id",
ADD COLUMN     "empresa_id" UUID NOT NULL;

-- Eliminar CadenaComercial (su trigger updated_at cae con la tabla)
DROP TABLE "core"."cadenas_comerciales";

-- Nueva relacion empresa <- tipos_addenda
CREATE INDEX "tipos_addenda_empresa_id_idx" ON "core"."tipos_addenda"("empresa_id");
CREATE UNIQUE INDEX "tipos_addenda_empresa_id_nombre_key" ON "core"."tipos_addenda"("empresa_id", "nombre");
ALTER TABLE "core"."tipos_addenda" ADD CONSTRAINT "tipos_addenda_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "core"."empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
