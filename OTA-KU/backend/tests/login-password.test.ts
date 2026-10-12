import { hash } from "bcrypt";
import { beforeAll, describe, expect, test } from "vitest";

import { verifyLoginPassword } from "../src/lib/login-password.js";

describe("verifyLoginPassword", () => {
  let passwordHash: string;
  let temporaryPasswordHash: string;

  beforeAll(async () => {
    passwordHash = await hash("Password-lama1!", 4);
    temporaryPasswordHash = await hash("Sementara-123!", 4);
  });

  test("password salah ditolak meski ada temporary password aktif", async () => {
    await expect(
      verifyLoginPassword({
        password: "tebakan-salah",
        provider: "credentials",
        passwordHash,
        temporaryPasswordHash,
      }),
    ).resolves.toBeNull();
  });

  test("temporary password yang cocok diterima", async () => {
    await expect(
      verifyLoginPassword({
        password: "Sementara-123!",
        provider: "credentials",
        passwordHash,
        temporaryPasswordHash,
      }),
    ).resolves.toBe("temporary");
  });

  test("password biasa tetap diterima saat ada temporary password", async () => {
    await expect(
      verifyLoginPassword({
        password: "Password-lama1!",
        provider: "credentials",
        passwordHash,
        temporaryPasswordHash,
      }),
    ).resolves.toBe("password");
  });

  test("password biasa diterima tanpa temporary password", async () => {
    await expect(
      verifyLoginPassword({ password: "Password-lama1!", provider: "credentials", passwordHash }),
    ).resolves.toBe("password");
  });

  test("temporary password tidak berlaku untuk akun non-credentials", async () => {
    await expect(
      verifyLoginPassword({
        password: "Sementara-123!",
        provider: "keycloak",
        passwordHash: null,
        temporaryPasswordHash,
      }),
    ).resolves.toBeNull();
  });

  test("akun tanpa password lokal (SSO/impor) ditolak, bukan error", async () => {
    await expect(
      verifyLoginPassword({ password: "apa-saja", provider: "credentials", passwordHash: null }),
    ).resolves.toBeNull();
  });
});
