import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSsoAccount, generateTemporaryPassword } from "@/lib/sso";
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

    // Check user is still Guest and doesn't have Keycloak account
    if (user.role !== "Guest") {
      return NextResponse.json(
        { error: "User is not a Guest - already assigned a role" },
        { status: 400 }
      );
    }

    if (user.oid) {
      return NextResponse.json(
        { error: "User already has Keycloak account - already approved" },
        { status: 400 }
      );
    }

    console.log(`[Admin Approve] Creating Keycloak account for ${user.email} with role ${role}`);

    // user.password is a bcrypt hash of the password the user picked at
    // registration — it must never be forwarded to Keycloak as a real
    // credential (the user could never log in with it). Generate a fresh
    // temporary password for the Keycloak account instead.
    // TODO: deliver `temporaryPassword` to the user (email/WhatsApp) and force
    // a password change on first login. For now it is returned to the admin
    // caller so it can be relayed manually.
    const temporaryPassword = generateTemporaryPassword();

    // Create Keycloak account with the assigned role
    const ssoUser = await createSsoAccount({
      email: user.email,
      password: temporaryPassword,
      role: roleToKeycloak(role),
      firstName: user.name?.split(" ")[0] || user.name,
      lastName: user.name?.split(" ").slice(1).join(" ") || ""
    });

    console.log(`[Admin Approve] Keycloak account created with oid: ${ssoUser.userId}`);

    // Update local user with Keycloak info and new role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        oid: ssoUser.userId,
        provider: "keycloak" as any,
        role: role as any,
        verificationStatus: "verified" as any
      }
    });

    console.log(`[Admin Approve] Local user updated with role ${role}`);

    return NextResponse.json({
      success: true,
      message: `User ${user.email} berhasil disetujui sebagai ${role} dan Keycloak account telah dibuat. User sekarang bisa login via SSO.`,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        oid: updatedUser.oid,
        provider: updatedUser.provider
      },
      temporaryPassword
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
