import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import {
  validateEmail, 
  validatePassword, 
  
} from "@/utils/_validation";

import { prisma } from "@/lib/prisma";
import { generateOTP, sendOtpEmail, OTP_TTL_MS } from "@/lib/otp";
import { createSsoAccount, deleteSsoAccount } from "@/lib/sso";

// Role sementara selama akun masih menunggu approval. Akunnya nonaktif, jadi
// role ini belum memberi akses apa pun; admin menggantinya saat approve.
const DEFAULT_PENDING_KEYCLOAK_ROLE = "volunteer-pewawancara";

type Errors = {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
  general?: string[]
}

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Register a new user
 *     description: Creates a new guest user account with validation checks
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - confirmPassword
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: StrongPass123!
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 example: StrongPass123!
 *     responses:
 *       302:
 *         description: Redirect to login page on success
 *         headers:
 *           Location:
 *             schema:
 *               type: string
 *               example: /auth/login
 *       400:
 *         description: Validation errors
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   example: "Name is required"
 *                 email:
 *                   type: string
 *                   example: "Invalid email format"
 *                 password:
 *                   type: string
 *                   example: "Password must contain at least 8 characters"
 *                 confirmPassword:
 *                   type: string
 *                   example: "Passwords do not match"
 *                 general:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Failed to create user"]
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to create user."
 * 
 */
export async function POST(req: Request) {
  try {
    const { name, email, password, confirmPassword } = await req.json();
    const errors: Errors = {};

    if(!name) {
      errors.name = "Name is required"
      return NextResponse.json(errors, { status: 400 });
    }

    if(!email){
      errors.email = "Email is required"
      return NextResponse.json(errors, { status: 400 });
    }

    const emailError = validateEmail(email); 
    if(emailError){
      errors.email = emailError;
      return NextResponse.json(errors, { status: 400 });
    }

    if(!password){
      errors.password = "Password is required"
      return NextResponse.json(errors, { status: 400 });
    }

    const passwordError = validatePassword(password); 
    if(passwordError){
      errors.password = passwordError
      return NextResponse.json(errors, { status: 400 });
    }

    if(!confirmPassword){
      errors.confirmPassword = "Confirm Password is required"
      return NextResponse.json(errors, { status: 400 });
    }

    if (password !== confirmPassword){
      errors.confirmPassword = "Password and Confirm Password must be same."
      return NextResponse.json(errors, { status: 400 });
    }
    
    // hash the password before saving it to the database
    const saltRounds = 10; 
    const hashedPassword = await bcrypt.hash(password, saltRounds); 

    // Normalize email to lowercase for consistency
    const normalizedEmail = email.toLowerCase();

    // check the email is already registered or not 
    const isUserExists = await prisma.user.findFirst({
      where: { email: normalizedEmail }
    })

    if(isUserExists){
      errors.email = "Email already registered. If you feel wrong contact the admin"
      return NextResponse.json(errors, { status: 400 });
    }

    // Akun Keycloak dibuat di sini — satu-satunya titik di mana password
    // plaintext pilihan user masih tersedia — tapi dalam keadaan NONAKTIF.
    // Akun nonaktif tidak bisa dipakai login ke aplikasi mana pun, jadi user
    // belum memperoleh akses apa pun sebelum admin approve. Saat approve,
    // role diganti ke role final lalu akunnya diaktifkan.
    const nameParts = name.trim().split(" ");
    let keycloakUserId: string;
    try {
      const ssoResult = await createSsoAccount({
        email: normalizedEmail,
        password,
        role: DEFAULT_PENDING_KEYCLOAK_ROLE,
        firstName: nameParts[0] ?? "",
        lastName: nameParts.slice(1).join(" ") || undefined,
        enabled: false,
      });
      keycloakUserId = ssoResult.userId;
    } catch (ssoError) {
      console.error("[SSO] Gagal membuat akun:", ssoError);
      return NextResponse.json(
        { general: [`Gagal mendaftarkan akun SSO: ${(ssoError as Error).message}`] },
        { status: 500 }
      );
    }

    let newUser;
    try {
      newUser = await prisma.user.create({
        data: {
          name,
          email: normalizedEmail,
          password: hashedPassword,
          role: "Guest",
          provider: "keycloak",
          oid: keycloakUserId,
        }
      });
    } catch (dbError) {
      // Jangan tinggalkan akun Keycloak yatim kalau penyimpanan lokal gagal —
      // email-nya akan terkunci dan user tidak bisa mendaftar ulang.
      await deleteSsoAccount({ keycloakUserId }).catch((cleanupError) =>
        console.error("[SSO] Gagal membersihkan akun setelah kegagalan DB:", cleanupError)
      );
      throw dbError;
    }

    if (!newUser) {
      errors.general = ["Failed to create user"];
      return NextResponse.json(errors, { status: 400 });
    }

    // Verifikasi email lewat OTP. Admin baru bisa approve setelah email
    // terverifikasi (lihat guard di /api/admin/users/approve), jadi OTP ini
    // syarat tambahan — bukan pengganti — persetujuan admin.
    const code = generateOTP();
    await prisma.oTP.create({
      data: {
        userId: newUser.id,
        code,
        expiredAt: new Date(Date.now() + OTP_TTL_MS),
      },
    });

    try {
      await sendOtpEmail(normalizedEmail, code);
    } catch (mailError) {
      // Akun sudah terlanjur dibuat; jangan gagalkan registrasi hanya karena
      // email tidak terkirim — user bisa memakai tombol kirim ulang.
      console.error(`[email] Gagal mengirim OTP ke ${normalizedEmail}:`, mailError);
    }

    return NextResponse.json({
      success: true,
      message: "Akun berhasil dibuat. Kode verifikasi telah dikirim ke email Anda.",
      user: {
        id: newUser.id,
        email: normalizedEmail,
        name,
        role: "Guest",
        status: "Menunggu verifikasi email"
      }
    }, { status: 201 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create user." }, { status: 500 });
  }
}
