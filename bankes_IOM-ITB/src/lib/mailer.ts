import nodemailer from "nodemailer";

/**
 * Satu-satunya tempat konfigurasi SMTP Bankes.
 * Kredensialnya dibagi dengan OTA-KU lewat env EMAIL / EMAIL_PASSWORD.
 */
export async function sendMail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    secure: true,
    port: 465,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL,
    to,
    subject,
    html,
  });
}
