// Helper login SSO IOM-ITB (Keycloak, realm iom-itb-sso — repo iom-itb-sso-NG).
// Semua URL diambil dari env build-time; tidak ada lagi URL staging yang di-hardcode.

const STATE_KEY = "ota-ku.keycloak-state";

function issuerUrl(): string {
  const issuer = import.meta.env.VITE_KEYCLOAK_ISSUER_URL as string | undefined;
  if (!issuer) {
    throw new Error("VITE_KEYCLOAK_ISSUER_URL belum dikonfigurasi");
  }
  return issuer.replace(/\/$/, "");
}

function randomState(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Buat URL authorization Keycloak dan simpan `state` untuk dicek di callback.
 * Dipanggil saat tombol diklik (bukan saat render) agar state selalu baru.
 */
export function buildKeycloakLoginUrl(): string {
  const state = randomState();
  sessionStorage.setItem(STATE_KEY, state);

  const params = new URLSearchParams({
    client_id: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
    redirect_uri: import.meta.env.VITE_KEYCLOAK_REDIRECT_URI,
    response_type: "code",
    scope: "openid email profile",
    state,
  });

  return `${issuerUrl()}/protocol/openid-connect/auth?${params.toString()}`;
}

export function redirectToKeycloakLogin(): void {
  window.location.href = buildKeycloakLoginUrl();
}

/** Cocokkan `state` dari callback dengan yang disimpan, lalu hapus. */
export function consumeKeycloakState(state: string | null): boolean {
  const expected = sessionStorage.getItem(STATE_KEY);
  sessionStorage.removeItem(STATE_KEY);
  return Boolean(state && expected && state === expected);
}
