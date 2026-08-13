import "../src/load-env.js";
import { hash } from "@node-rs/argon2";
import { PrismaPg } from "@prisma/adapter-pg";
import { SORIANA_CONSOLIDADA, SORIANA_EXTEMPORANEA } from "@addendex/shared";
import { PrismaClient } from "../src/generated/prisma/client.js";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Las configuraciones viven tipadas en @addenda/shared; al persistirlas como
// JSONB las pasamos como objeto plano.
const asJson = (value: unknown) => JSON.parse(JSON.stringify(value));

async function main() {
  const soriana = await prisma.empresa.upsert({
    where: { rfc: "TSO991022PB6" },
    update: {},
    create: { nombre: "Soriana", rfc: "TSO991022PB6", direccion: "Monterrey, Nuevo Leon, Mexico" },
  });

  await prisma.tipoAddenda.upsert({
    where: { empresaId_nombre: { empresaId: soriana.id, nombre: "Consolidada" } },
    update: { configuracionCampos: asJson(SORIANA_CONSOLIDADA) },
    create: {
      empresaId: soriana.id,
      nombre: "Consolidada",
      configuracionCampos: asJson(SORIANA_CONSOLIDADA),
    },
  });

  await prisma.tipoAddenda.upsert({
    where: { empresaId_nombre: { empresaId: soriana.id, nombre: "Extemporanea" } },
    update: { configuracionCampos: asJson(SORIANA_EXTEMPORANEA) },
    create: {
      empresaId: soriana.id,
      nombre: "Extemporanea",
      configuracionCampos: asJson(SORIANA_EXTEMPORANEA),
    },
  });

  const adminPassword = "Admin123!";
  await prisma.usuario.upsert({
    where: { correo: "admin@addenda.local" },
    update: {},
    create: {
      nombre: "Administrador",
      correo: "admin@addenda.local",
      passwordHash: await hash(adminPassword),
      rol: "ADMIN",
    },
  });

  const usuarioPassword = "User123!";
  await prisma.usuario.upsert({
    where: { correo: "user@addenda.local" },
    update: {},
    create: {
      nombre: "Usuario Demo",
      correo: "user@addenda.local",
      passwordHash: await hash(usuarioPassword),
      rol: "USER",
    },
  });

  console.log("Seed completado: empresa Soriana, tipos, admin y usuario demo.");
  console.log(`Admin   -> admin@addenda.local / ${adminPassword}`);
  console.log(`Usuario -> user@addenda.local / ${usuarioPassword}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
