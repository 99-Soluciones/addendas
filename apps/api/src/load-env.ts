import { config } from "dotenv";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Este archivo vive en apps/api/src, asi que sube tres niveles hasta la raiz.
const envPath = resolve(fileURLToPath(new URL(".", import.meta.url)), "../../../.env");
config({ path: envPath });
