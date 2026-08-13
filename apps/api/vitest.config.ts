import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "test/**/*.test.ts"],
    // Carga el .env de la raiz del monorepo antes de los tests para que el parser
    // de env.ts no aborte en local. En CI no hay .env (dotenv es no-op) y siguen
    // valiendo las variables que inyecta el workflow; dotenv no sobreescribe las
    // ya presentes.
    setupFiles: ["./src/load-env.ts"],
  },
  resolve: {
    // Permite imports estilo NodeNext (".js") que resuelven al fuente ".ts".
    extensionAlias: {
      ".js": [".ts", ".js"],
    },
  },
  plugins: [
    // SWC transforma los .ts emitiendo metadata de decoradores (esbuild de Vitest
    // no lo hace), necesario para la DI de NestJS en los tests e2e.
    swc.vite({
      jsc: {
        parser: { syntax: "typescript", decorators: true },
        transform: { legacyDecorator: true, decoratorMetadata: true },
      },
    }),
  ],
});
