import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateSsoRole, enableSsoAccount } from "@/lib/sso";
import { sendMail } from "@/lib/mailer";
import { registrasiAktifEmail } from "@/lib/email/registrasi-aktif";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

type ApproveRequest = {
  userId: string;
  role: "Mahasiswa" | "Pewawancara" | "Pengurus_IOM";
};

/**
 * POST /api/admin/users/approve
 * 
 * Admin-only endpoint to approve a registered user and create their Keycloak account
 * 
 * Flow:
 * 1. Verify admin session
 * 2. Find local user (Guest)
 * 3. Call SSO API to create Keycloak account
 * 4. Update local user: set oid, provider, role, verificationStatus
 * 5. Return success
 */
export async function POST(req: Request) {
  try {
    // Check admin session
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "Admin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    const { userId, role } = (await req.json()) as ApproveRequest;

    if (!userId || !role) {
      return NextResponse.json(
        { error: "userId and role are required" },
        { status: 400 }
      );
    }

    console.log(`[Admin Approve] Processing user ${userId} with role ${role}`);

    // Find the user
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Email harus sudah diverifikasi lewat OTP sebelum admin bisa approve —
    // tanpa guard ini langkah verifikasi email jadi tidak ada artinya.
    if (user.verificationStatus !== "verified") {
      return NextResponse.json(
        { error: "User belum memverifikasi email. Minta user menyelesaikan verifikasi OTP terlebih dahulu." },
        { status: 400 }
      );
    }

    // Check user is still Guest and doesn't have Keycloak account
    if (user.role !== "Guest") {
      return NextResponse.json(
        { error: "User is not a Guest - already assigned a role" },
        { status: 400 }
      );
    }

    if (!user.oid) {
      return NextResponse.json(
        { error: "User tidak punya akun SSO. Akun lama sebelum fitur ini perlu didaftarkan ulang." },
        { status: 400 }
      );
    }

    console.log(`[Admin Approve] Setting role ${role} and enabling account for ${user.email}`);

    // Akun Keycloak sudah dibuat saat registrasi dengan password pilihan user,
    // dalam keadaan nonaktif. Approval tinggal menetapkan role final lalu
    // mengaktifkannya — tidak ada temporary password yang perlu dibagikan.
    await updateSsoRole({
      keycloakUserId: user.oid,
      role: roleToKeycloak(role),
    });

    await enableSsoAccount({ keycloakUserId: user.oid });

    console.log(`[Admin Approve] Keycloak account ${user.oid} enabled with role ${role}`);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        role: role as any,
      }
    });

    console.log(`[Admin Approve] Local user updated with role ${role}`);

    // Notifikasi ke user bahwa akunnya sudah aktif. Kegagalan kirim email
    // tidak boleh membatalkan approval yang sudah terjadi di Keycloak.
    try {
      const loginUrl = process.env.NEXTAUTH_URL
        ? `${process.env.NEXTAUTH_URL.replace(/\/+$/, "")}/auth/login`
        : "https://bankes.iom-itb.id/auth/login";

      await sendMail({
        to: updatedUser.email,
        subject: "Pendaftaran Akun Bankes Telah Terverifikasi",
        html: registrasiAktifEmail({
          nama: updatedUser.name,
          role: String(updatedUser.role),
          loginUrl,
        }),
      });
    } catch (mailError) {
      console.error(`[email] Gagal mengirim notifikasi aktivasi ke ${updatedUser.email}:`, mailError);
    }

    return NextResponse.json({
      success: true,
      message: `User ${user.email} berhasil disetujui sebagai ${role}. Akun SSO-nya sudah aktif dan user bisa login dengan kata sandi yang dibuat saat mendaftar.`,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        oid: updatedUser.oid,
        provider: updatedUser.provider
      }
    }, { status: 200 });

  } catch (error) {
    console.error("[Admin Approve] Error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to approve user",
        details: errorMessage
      },
      { status: 500 }
    );
  }
}

/**
 * Map local role to Keycloak role
 */
function roleToKeycloak(localRole: string): string {
  const mapping: Record<string, string> = {
    "Mahasiswa": "mahasiswa",
    "Pewawancara": "volunteer-pewawancara",
    "OrangTuaAsuh": "orang-tua-asuh",
    "Pengurus_IOM": "pengurus-bidang-1",
    "Admin": "admin",
    "Bankes": "bankes"
  };
  return mapping[localRole] || "mahasiswa";
}
