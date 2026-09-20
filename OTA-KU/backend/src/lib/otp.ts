import nodemailer from "nodemailer";

import { env } from "../config/env.config.js";
import { otpVerificationEmail } from "./email/verifikasi-otp.js";

export function generateOTP(): string {
  const hex = "0123456789ABCDEF";
  let output = "";
  for (let i = 0; i < 6; ++i) {
    output += hex.charAt(Math.floor(Math.random() * hex.length));
  }
  return output;
}

// Dipakai baik saat registrasi maupun resend OTP, supaya konfigurasi SMTP
// (dan perilaku "kirim ke TEST_EMAIL di non-production") konsisten di satu
// tempat alih-alih diduplikasi di tiap controller seperti email lain di file ini.
export async function sendOtpEmail(to: string, code: string): Promise<void> {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    secure: true,
    port: 465,
    auth: {
      user: env.EMAIL,
      pass: env.EMAIL_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: env.EMAIL_FROM,
    to: env.NODE_ENV !== "production" ? env.TEST_EMAIL : to,
    subject: "Kode Verifikasi OTP - Bantuan Orang Tua Asuh",
    html: otpVerificationEmail(to, code),
  });
}
