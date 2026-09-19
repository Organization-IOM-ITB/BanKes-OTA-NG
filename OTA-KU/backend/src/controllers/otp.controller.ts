import { env } from "../config/env.config.js";
import { prisma } from "../db/prisma.js";
import { generateOTP, sendOtpEmail } from "../lib/otp.js";
import { sendWhatsApp } from "../lib/whatsapp.js";
import { getOtpExpiredDateRoute, sendOtpRoute } from "../routes/otp.route.js";
import { SendOtpRequestSchema } from "../zod/otp.js";
import { createAuthRouter, createRouter } from "./router-factory.js";

export const otpRouter = createRouter();
export const otpProtectedRouter = createAuthRouter();

otpProtectedRouter.openapi(sendOtpRoute, async (c) => {
  const { id } = c.var.user;
  const body = await c.req.formData();
  const { otpChannel } = SendOtpRequestSchema.parse(Object.fromEntries(body.entries()));

  try {
    const user = await prisma.user.findFirst({
      where: { id },
      include: { OTPs: true },
    });

    if (!user || user.OTPs.length === 0) {
      return c.json(
        {
          success: false,
          message: "User not found",
          error: {},
        },
        404,
      );
    }

    if (otpChannel === "whatsapp" && !user.phoneNumber) {
      return c.json(
        {
          success: false,
          message: "User not found",
          error: {},
        },
        404,
      );
    }

    const code = generateOTP();
    await prisma.oTP.updateMany({
      where: { userId: user.id },
      data: { code, expiredAt: new Date(Date.now() + 1000 * 60 * 15) },
    });

    if (otpChannel === "whatsapp") {
      const message =
        `Berikut adalah kode OTP Anda\n` +
        `${code}\n` +
        `Gunakan kode OTP ini untuk melakukan registrasi akun Anda. ` +
        `Kode OTP ini akan kadaluwarsa dalam 15 menit.\n\n` +
        `Jika Anda merasa tidak melakukan permintaan ini, ` +
        `silakan abaikan pesan ini atau hubungi administrator.\n\n` +
        `Terima kasih.`;

      try {
        await sendWhatsApp({
          to: user.phoneNumber!,
          message,
          clientReference: `otp-resend-${user.id}`,
          idempotencyKey: `otp-resend-${user.id}-${code}`,
        });
      } catch (err) {
        console.error(`[whatsapp] Failed to send WA to ${user.phoneNumber}:`, err);
      }
    } else {
      try {
        await sendOtpEmail(user.email, code);
      } catch (err) {
        console.error(`[email] Failed to send OTP to ${user.email}:`, err);
      }
    }

    return c.json(
      {
        success: true,
        message: "OTP sent successfully",
      },
      200,
    );
  } catch (error) {
    console.error(error);
    return c.json(
      {
        success: false,
        message: "Internal server error",
        error: error,
      },
      500,
    );
  }
});

otpProtectedRouter.openapi(getOtpExpiredDateRoute, async (c) => {
  const user = c.var.user;

  try {
    const otp = await prisma.oTP.findFirst({
      where: { userId: user.id },
      orderBy: { expiredAt: "desc" },
    });

    if (!otp) {
      return c.json(
        {
          success: false,
          message: "OTP not found",
          error: {},
        },
        404,
      );
    }

    const expiredAt = otp.expiredAt.toISOString();
    return c.json(
      {
        success: true,
        message: "OTP expired date retrieved successfully",
        expiredAt,
      },
      200,
    );
  } catch (error) {
    console.error(error);
    return c.json(
      {
        success: false,
        message: "Failed to retrieve OTP expired date",
        error: error,
      },
      500,
    );
  }
});
