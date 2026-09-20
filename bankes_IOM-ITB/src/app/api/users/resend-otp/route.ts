import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOTP, sendOtpEmail, OTP_TTL_MS } from "@/lib/otp";

/**
 * @swagger
 * /api/users/resend-otp:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Resend registration OTP
 *     description: Issues a fresh OTP code and emails it to the user.
 */
export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email wajib diisi." },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).toLowerCase();
    const user = await prisma.user.findFirst({
      where: { email: normalizedEmail },
    });

    // Jawaban sengaja dibuat sama untuk akun yang tidak ada maupun yang sudah
    // terverifikasi, supaya endpoint ini tidak bisa dipakai menebak email mana
    // yang terdaftar.
    if (!user || user.verificationStatus === "verified") {
      return NextResponse.json({
        success: true,
        message: "Jika email terdaftar dan belum terverifikasi, kode baru telah dikirim.",
      });
    }

    const code = generateOTP();
    await prisma.$transaction([
      prisma.oTP.deleteMany({ where: { userId: user.id } }),
      prisma.oTP.create({
        data: {
          userId: user.id,
          code,
          expiredAt: new Date(Date.now() + OTP_TTL_MS),
        },
      }),
    ]);

    try {
      await sendOtpEmail(normalizedEmail, code);
    } catch (mailError) {
      console.error(`[email] Gagal mengirim ulang OTP ke ${normalizedEmail}:`, mailError);
      return NextResponse.json(
        { success: false, error: "Gagal mengirim email. Coba lagi beberapa saat lagi." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Jika email terdaftar dan belum terverifikasi, kode baru telah dikirim.",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Gagal mengirim ulang kode." },
      { status: 500 }
    );
  }
}
