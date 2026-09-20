const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const ROLE_LABELS: Record<string, string> = {
  Admin: "Admin",
  Mahasiswa: "Mahasiswa",
  Pewawancara: "Pewawancara",
  OrangTuaAsuh: "Orang Tua Asuh",
  Pengurus_IOM: "Pengurus IOM",
  Bankes: "Bantuan Kesejahteraan",
};

/**
 * Email notifikasi setelah admin memverifikasi pendaftaran.
 * Disesuaikan dari email verifikasi OTA-KU (registrasi-accepted), dengan
 * nama aplikasi dan role yang sesuai untuk Bankes.
 */
export function registrasiAktifEmail({
  nama,
  role,
  loginUrl,
}: {
  nama?: string | null;
  role: string;
  loginUrl: string;
}) {
  const roleLabel = ROLE_LABELS[role] || role;
  const greeting = nama ? escapeHtml(nama) : "Pendaftar";

  return `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px;">
  <h2 style="color:#003399;margin-bottom:4px;">IOM ITB</h2>
  <p style="color:#6b7280;margin-top:0;">Pendaftaran Terverifikasi</p>
  <div style="height:1px;background:#e5e7eb;margin:16px 0;"></div>
  <p>Halo <strong>${greeting}</strong>,</p>
  <p>Pendaftaran akun IOM-ITB untuk aplikasi <strong>Bankes</strong> sudah terverifikasi dan aktif.</p>
  <table style="width:100%;border-collapse:collapse;margin:16px 0;">
    <tr><td style="padding:8px 0;color:#6b7280;">Aplikasi</td><td style="padding:8px 0;font-weight:bold;">Bankes</td></tr>
    <tr><td style="padding:8px 0;color:#6b7280;">Role</td><td style="padding:8px 0;font-weight:bold;">${escapeHtml(roleLabel)}</td></tr>
  </table>
  <p>Anda sudah bisa masuk menggunakan email dan kata sandi yang Anda buat saat mendaftar.</p>
  <div style="margin:24px 0;text-align:center;">
    <a href="${escapeHtml(loginUrl)}" style="display:inline-block;background:#003399;color:#ffffff;text-decoration:none;padding:10px 25px;border-radius:4px;font-size:14px;">Masuk Sekarang</a>
  </div>
  <p style="color:#6b7280;font-size:13px;margin-top:24px;">Salam,<br><strong>IOM ITB</strong></p>
</div>`;
}
