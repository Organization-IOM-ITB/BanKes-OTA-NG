/**
 * Helper function untuk berinteraksi dengan SSO API (Keycloak)
 * Digunakan terutama untuk admin approval flow
 */

/**
 * Membuat akun Keycloak baru untuk user yang telah disetujui
 * Dipanggil dari admin approval action
 *
 * @param email - Email user
 * @param password - Password temporary (user akan diminta change setelah login pertama)
 * @param role - Role Keycloak (e.g., "mahasiswa", "pengurus-bidang-1")
 * @param firstName - Nama depan (opsional)
 * @param lastName - Nama belakang (opsional)
 * @returns { userId, email, role } dari SSO API
 */
export async function createSsoAccount({
  email,
  password,
  role,
  firstName,
  lastName,
  enabled = true,
}: {
  email: string;
  password: string;
  role: string;
  firstName?: string;
  lastName?: string;
  /**
   * Set false untuk membuat akun yang belum bisa dipakai login.
   * Dipakai saat registrasi Bankes: akun dibuat dengan password pilihan user,
   * tapi baru diaktifkan setelah admin approve.
   */
  enabled?: boolean;
}): Promise<{ userId: string; email: string; role: string }> {
  const ssoApiUrl = process.env.SSO_API_URL;
  const registerApiKey = process.env.REGISTER_API_KEY;

  if (!ssoApiUrl || !registerApiKey) {
    throw new Error(
      "SSO_API_URL or REGISTER_API_KEY environment variables are not set"
    );
  }

  const body: Record<string, string | boolean> = { email, password, role, enabled };
  if (firstName) body.firstName = firstName;
  if (lastName) body.lastName = lastName;

  const res = await fetch(`${ssoApiUrl}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": registerApiKey,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      err.message ?? `SSO registration failed with status ${res.status}`
    );
  }

  const data = await res.json();
  return data.data || data;
}

/**
 * Mengaktifkan akun Keycloak yang dibuat nonaktif saat registrasi.
 * Dipanggil saat admin approve, bersamaan dengan penetapan role final.
 */
export async function enableSsoAccount({
  keycloakUserId,
}: {
  keycloakUserId: string;
}): Promise<void> {
  const ssoApiUrl = process.env.SSO_API_URL;
  const registerApiKey = process.env.REGISTER_API_KEY;

  if (!ssoApiUrl || !registerApiKey) {
    throw new Error(
      "SSO_API_URL or REGISTER_API_KEY environment variables are not set"
    );
  }

  const res = await fetch(`${ssoApiUrl}/auth/users/${keycloakUserId}/enabled`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": registerApiKey,
    },
    body: JSON.stringify({ enabled: true }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      err.message ?? `Failed to enable SSO account (status ${res.status})`
    );
  }
}

/**
 * Map role lokal ke role Keycloak
 * Digunakan saat admin membuat akun SSO untuk user baru
 */
export function localRoleToKeycloak(localRole: string): string {
  const mapping: { [key: string]: string } = {
    Admin: "admin",
    Mahasiswa: "mahasiswa",
    Pewawancara: "volunteer-pewawancara",
    OrangTuaAsuh: "orang-tua-asuh",
    Pengurus_IOM: "pengurus-bidang-1",
    Guest: "mahasiswa", // fallback ke mahasiswa karena SSO tidak punya role guest
    Bankes: "bendahara",
  };

  return mapping[localRole] || "user";
}

/**
 * Hapus akun user dari Keycloak
 * Dipanggil saat admin delete user agar tidak ada ghost account di Keycloak
 *
 * @param keycloakUserId - UUID user di Keycloak (oid)
 */
export async function deleteSsoAccount({
  keycloakUserId,
}: {
  keycloakUserId: string;
}): Promise<void> {
  const ssoApiUrl = process.env.SSO_API_URL;
  const registerApiKey = process.env.REGISTER_API_KEY;

  if (!ssoApiUrl || !registerApiKey) {
    throw new Error(
      "SSO_API_URL or REGISTER_API_KEY environment variables are not set"
    );
  }

  const res = await fetch(`${ssoApiUrl}/auth/users/${keycloakUserId}`, {
    method: "DELETE",
    headers: {
      "X-Api-Key": registerApiKey,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      err.message ?? `SSO delete failed with status ${res.status}`
    );
  }
}

/**
 * Update role user yang sudah ada di Keycloak
 * Dipanggil saat admin approve dan assign role ke user
 *
 * @param keycloakUserId - UUID user di Keycloak (oid)
 * @param role - Role Keycloak baru
 */
export async function updateSsoRole({
  keycloakUserId,
  role,
}: {
  keycloakUserId: string;
  role: string;
}): Promise<void> {
  const ssoApiUrl = process.env.SSO_API_URL;
  const registerApiKey = process.env.REGISTER_API_KEY;

  if (!ssoApiUrl || !registerApiKey) {
    throw new Error(
      "SSO_API_URL or REGISTER_API_KEY environment variables are not set"
    );
  }

  const res = await fetch(`${ssoApiUrl}/auth/users/${keycloakUserId}/role`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": registerApiKey,
    },
    body: JSON.stringify({ role }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      err.message ?? `SSO role update failed with status ${res.status}`
    );
  }
}
