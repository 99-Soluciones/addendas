-- Recuperacion de contrasena: tokens de reset opacos (hash SHA-256, con expiracion).
-- Consentimiento legal: una fila por documento aceptado al registrarse (auditable).

-- CreateEnum
CREATE TYPE "app_auth"."DocumentoLegal" AS ENUM ('TERMINOS', 'PRIVACIDAD', 'COOKIES');

-- CreateTable
CREATE TABLE "app_auth"."password_reset_tokens" (
    "id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expira_en" TIMESTAMP(3) NOT NULL,
    "usado" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_auth"."consentimientos" (
    "id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "documento" "app_auth"."DocumentoLegal" NOT NULL,
    "version" TEXT NOT NULL,
    "aceptado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consentimientos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "password_reset_tokens_usuario_id_idx" ON "app_auth"."password_reset_tokens"("usuario_id");

-- CreateIndex
CREATE INDEX "consentimientos_usuario_id_idx" ON "app_auth"."consentimientos"("usuario_id");

-- AddForeignKey
ALTER TABLE "app_auth"."password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "app_auth"."usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app_auth"."consentimientos" ADD CONSTRAINT "consentimientos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "app_auth"."usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER FUNCTION core.set_updated_at() SET search_path = '';
