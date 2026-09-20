import { sendMail } from "./mailer";

export const OTP_TTL_MS = 1000 * 60 * 15;

export function generateOTP(): string {
  const hex = "0123456789ABCDEF";
  let output = "";
  for (let i = 0; i < 6; ++i) {
    output += hex.charAt(Math.floor(Math.random() * hex.length));
  }
  return output;
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const otpEmailHtml = (email: string, code: string) => `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px;">
  <h2 style="color:#003399;margin-bottom:4px;">IOM ITB</h2>
  <p style="color:#6b7280;margin-top:0;">Verifikasi Email Pendaftaran BanKes</p>
  <div style="height:1px;background:#e5e7eb;margin:16px 0;"></div>
  <p>Halo <strong>${escapeHtml(email)}</strong>,</p>
  <p>Berikut adalah kode verifikasi untuk pendaftaran akun BanKes Anda:</p>
  <div style="background:#f5f5f5;border-radius:8px;padding:16px;text-align:center;margin:16px 0;">
    <span style="font-size:24px;font-weight:bold;letter-spacing:6px;color:#003399;">${code}</span>
  </div>
  <p>Kode ini berlaku selama <strong>15 menit</strong>. Setelah email terverifikasi, pendaftaran Anda akan ditinjau oleh admin sebelum akun dapat digunakan.</p>
  <p style="color:#6b7280;font-size:13px;">Jika Anda tidak melakukan pendaftaran ini, abaikan email ini.</p>
  <p style="color:#6b7280;font-size:13px;margin-top:24px;">Salam,<br><strong>IOM ITB</strong></p>
</div>`;

export async function sendOtpEmail(to: string, code: string): Promise<void> {
  await sendMail({
    to,
    subject: "Kode Verifikasi Pendaftaran BanKes - IOM ITB",
    html: otpEmailHtml(to, code),
  });
}
