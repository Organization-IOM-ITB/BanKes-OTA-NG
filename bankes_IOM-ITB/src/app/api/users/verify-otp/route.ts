import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * @swagger
 * /api/users/verify-otp:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Verify registration OTP
 *     description: Marks the user's email as verified when the OTP code is valid and not expired.
 */
export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json(
        { success: false, error: "Email dan kode verifikasi wajib diisi." },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).toLowerCase();
    const user = await prisma.user.findFirst({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Akun tidak ditemukan." },
        { status: 404 }
      );
    }

    if (user.verificationStatus === "verified") {
      return NextResponse.json({
        success: true,
        message: "Email sudah terverifikasi sebelumnya.",
      });
    }

    const otp = await prisma.oTP.findFirst({
      where: {
        userId: user.id,
        code: String(code).trim().toUpperCase(),
      },
    });

    if (!otp) {
      return NextResponse.json(
        { success: false, error: "Kode verifikasi salah." },
        { status: 400 }
      );
    }

    if (otp.expiredAt < new Date()) {
      return NextResponse.json(
        { success: false, error: "Kode verifikasi sudah kedaluwarsa. Silakan kirim ulang." },
        { status: 400 }
      );
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { verificationStatus: "verified" },
      }),
      prisma.oTP.deleteMany({ where: { userId: user.id } }),
    ]);

    return NextResponse.json({
      success: true,
      message:
        "Email berhasil diverifikasi. Pendaftaran Anda akan ditinjau admin sebelum akun dapat digunakan.",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Gagal memverifikasi kode." },
      { status: 500 }
    );
  }
}
