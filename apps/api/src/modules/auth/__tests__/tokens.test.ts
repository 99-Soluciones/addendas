import { describe, it, expect } from "vitest";
import {
  generateRefreshToken,
  generateResetToken,
  hashToken,
  parseDurationMs,
  signAccessToken,
  verifyAccessToken,
} from "../tokens.js";

describe("tokens", () => {
  it("firma y verifica un access token preservando sub y rol", async () => {
    const token = await signAccessToken("user-123", "ADMIN");
    const payload = await verifyAccessToken(token);
    expect(payload.sub).toBe("user-123");
    expect(payload.rol).toBe("ADMIN");
  });

  it("rechaza un token manipulado", async () => {
    await expect(verifyAccessToken("no-es-un-jwt")).rejects.toThrow();
  });

  it("parseDurationMs interpreta s/m/h/d", () => {
    expect(parseDurationMs("30s")).toBe(30_000);
    expect(parseDurationMs("15m")).toBe(900_000);
    expect(parseDurationMs("2h")).toBe(7_200_000);
    expect(parseDurationMs("7d")).toBe(604_800_000);
  });

  it("el hash del refresh token es estable y de 64 hex", () => {
    const { token, tokenHash } = generateRefreshToken();
    expect(hashToken(token)).toBe(tokenHash);
    expect(tokenHash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("el reset token es opaco, se guarda hasheado y es unico por llamada", () => {
    const a = generateResetToken();
    const b = generateResetToken();
    expect(hashToken(a.token)).toBe(a.tokenHash);
    expect(a.tokenHash).toMatch(/^[a-f0-9]{64}$/);
    expect(a.token).not.toBe(b.token);
  });
});
