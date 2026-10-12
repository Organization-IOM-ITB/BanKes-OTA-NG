import { compare } from "bcrypt";

export type LoginPasswordMatch = "temporary" | "password" | null;

/**
 * Cek password login.
 *
 * - Temporary password (hasil lupa password) hanya berlaku untuk akun
 *   `credentials` dan harus cocok — kalau tidak cocok, password biasa tetap
 *   dicoba agar user yang ingat password lamanya tetap bisa masuk.
 * - Akun tanpa password lokal (SSO / impor) tidak bisa login dengan password.
 *
 * Mengembalikan jenis password yang cocok, atau null (harus ditolak 401).
 */
export async function verifyLoginPassword(input: {
  password: string;
  provider: string;
  passwordHash: string | null;
  temporaryPasswordHash?: string | null;
}): Promise<LoginPasswordMatch> {
  if (
    input.provider === "credentials" &&
    input.temporaryPasswordHash &&
    (await compare(input.password, input.temporaryPasswordHash))
  ) {
    return "temporary";
  }

  if (input.passwordHash && (await compare(input.password, input.passwordHash))) {
    return "password";
  }

  return null;
}
