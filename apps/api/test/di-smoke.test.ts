import "reflect-metadata";
import { Injectable, Module } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { describe, expect, it } from "vitest";

// Smoke test del toolchain (Fase 0): verifica que la cadena Vitest -> unplugin-swc
// emite la metadata de tipos de decorador que NestJS usa para la DI por
// constructor. Si la metadata no se emitiera, .compile() no podria resolver
// DepService y este test fallaria.

@Injectable()
class DepService {
  ping(): string {
    return "pong";
  }
}

@Injectable()
class ConsumerService {
  constructor(private readonly dep: DepService) {}

  call(): string {
    return this.dep.ping();
  }
}

@Module({ providers: [DepService, ConsumerService] })
class SmokeModule {}

describe("NestJS DI metadata (toolchain)", () => {
  it("inyecta una dependencia por metadata de constructor", async () => {
    const moduleRef = await Test.createTestingModule({ imports: [SmokeModule] }).compile();
    const consumer = moduleRef.get(ConsumerService);
    expect(consumer.call()).toBe("pong");
  });
});
