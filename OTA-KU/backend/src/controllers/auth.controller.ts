import { compare, hash } from "bcrypt";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { decode, sign } from "hono/jwt";
import nodemailer from "nodemailer";
import { sendWhatsApp } from "../lib/whatsapp.js";

import { env } from "../config/env.config.js";
import { prisma } from "../db/prisma.js";
import { forgotPasswordEmail } from "../lib/email/lupa-password.js";
import {
  getNimFakultasCodeMap,
  getNimFakultasFromNimJurusanMap,
  getNimJurusanCodeMap,
} from "../lib/nim.js";
import { generateOTP, sendOtpEmail } from "../lib/otp.js";
import { generateSecurePassword } from "../lib/password.js";
import {
  forgotPasswordRoute,
  loginRoute,
  logoutRoute,
  oauthRoute,
  otpRoute,
  regisRoute,
  verifRoute,
} from "../routes/auth.route.js";
import {
  ForgotPasswordSchema,
  OTPVerificationRequestSchema,
  UserLoginRequestSchema,
  UserOAuthLoginRequestSchema,
  UserRegisRequestSchema,
} from "../zod/auth.js";
import { createAuthRouter, createRouter } from "./router-factory.js";
import { registerInSSO, keycloakRoleToType, keycloakRoleToLocalRole, validateKeycloakToken } from "../lib/sso.js";

export const authRouter = createRouter();
export const authProtectedRouter = createAuthRouter();

function roleToJwtType(role: string): "mahasiswa" | "ota" | "admin" | "bankes" | "pengurus" {
  const map: Record<string, "mahasiswa" | "ota" | "admin" | "bankes" | "pengurus"> = {
    Mahasiswa: "mahasiswa",
    OrangTuaAsuh: "ota",
    Admin: "admin",
    Bankes: "bankes",
    Pengurus_IOM: "pengurus",
  };
  return map[role] ?? "mahasiswa";
}

authRouter.openapi(loginRoute, async (c) => {
  const body = await c.req.formData();
  const data = Object.fromEntries(body.entries());

  const zodParseResult = UserLoginRequestSchema.parse(data);
  const { identifier, password } = zodParseResult;

  try {
    const foundAccount = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { phoneNumber: identifier },
        ],
      },
    });

    if (!foundAccount) {
      console.error("Invalid email");
      return c.json(
        {
          success: false,
          message: "Invalid credentials",
          error: "Invalid email or password",
        },
        401,
      );
    }

    const currentDateTime = new Date(Date.now());

    const temporaryPassword = await prisma.temporaryPassword.findFirst({
      where: {
        userId: foundAccount.id,
        expiredAt: { gte: currentDateTime },
        used: false,
      },
      orderBy: { expiredAt: "desc" },
    });

    if (
      foundAccount.provider === "credentials" &&
      temporaryPassword
    ) {
      const tempPass = temporaryPassword.password;
      const isTempPassValid = await compare(password, tempPass);

      if (isTempPassValid) {
        // Mark the temporary password as used
        await prisma.temporaryPassword.updateMany({
          where: {
            userId: temporaryPassword.userId,
            password: tempPass,
          },
          data: { used: true },
        });
      }
    } else {
      // Check the password hash
      const isPasswordValid = await compare(password, foundAccount.password!);

      if (!isPasswordValid) {
        console.error("Invalid password");
        return c.json(
          {
            success: false,
            message: "Invalid credentials",
            error: "Invalid email or password",
          },
          401,
        );
      }
    }

    const accountId = foundAccount.id;

    let name = null;

    if (foundAccount.role === "Mahasiswa") {
      const mahasiswaDetail = await prisma.mahasiswaProfile.findFirst({
        where: { userId: accountId },
        select: { name: true },
      });

      if (mahasiswaDetail) {
        name = mahasiswaDetail.name;
      }
    } else if (foundAccount.role === "OrangTuaAsuh") {
      const otaDetail = await prisma.otaProfile.findFirst({
        where: { userId: accountId },
        select: { name: true },
      });

      if (otaDetail) {
        name = otaDetail.name;
      }
    } else {
      const adminDetail = await prisma.adminProfile.findFirst({
        where: { userId: accountId },
        select: { name: true },
      });

      if (adminDetail) {
        name = adminDetail.name;
      }
    }

    const accessToken = await sign(
      {
        id: foundAccount.id,
        name,
        email: foundAccount.email,
        phoneNumber: foundAccount.phoneNumber,
        type: roleToJwtType(foundAccount.role),
        provider: foundAccount.provider,
        oid: foundAccount.oid,
        createdAt: foundAccount.createdAt,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
      },
      env.JWT_SECRET,
    );

    setCookie(c, "ota-ku.access-cookie", accessToken, {
      httpOnly: true,
      secure: env.COOKIE_SECURE,
      sameSite: "strict",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return c.json(
      {
        success: true,
        message: "Login successful",
        body: {
          token: accessToken,
        },
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

authRouter.openapi(regisRoute, async (c) => {
  const body = await c.req.formData();
  const data = Object.fromEntries(body.entries());

  const zodParseResult = UserRegisRequestSchema.parse(data);
  const { email, phoneNumber, password, type, otpChannel } = zodParseResult;

  // Check for existing account
  const existingAccount = await prisma.user.findFirst({
    where: { OR: [{ email }, { phoneNumber }] },
  });

  if (existingAccount) {
    return c.json(
      { success: false, message: "Email or phone number already registered" },
      409,
    );
  }

  // Determine Keycloak role from type
  const keycloakRole = type === "mahasiswa" ? "mahasiswa" : "orang-tua-asuh";

  // 1. Create user in Keycloak SSO (password goes here — never stored locally)
  let ssoUserId: string;
  try {
    const ssoResult = await registerInSSO({ email, password, role: keycloakRole });
    ssoUserId = ssoResult.userId;
  } catch (err: any) {
    if (err.status === 409) {
      return c.json(
        { success: false, message: "Email already registered in SSO" },
        409,
      );
    }
    console.error("[SSO] Registration failed:", err);
    return c.json(
      { success: false, message: "Failed to create SSO account. Try again later." },
      500,
    );
  }

  try {
    const [newUser, code] = await prisma.$transaction(async (tx) => {
      // 2. Create local user — no password stored, ssoId links to Keycloak
      const newUser = await tx.user.create({
        data: {
          email,
          phoneNumber,
          password: null,                // no local password
          oid: ssoUserId,                // Keycloak sub
          provider: "keycloak" as any,
          role: (type === "mahasiswa" ? "Mahasiswa" : "OrangTuaAsuh") as any,
          verificationStatus: "unverified",
        },
      });

      // 3. Generate OTP
      const code = generateOTP();
      await tx.oTP.create({
        data: {
          userId: newUser.id,
          code,
          expiredAt: new Date(Date.now() + 1000 * 60 * 15),
        },
      });

      return [newUser, code];
    });

    // 4. Send OTP via channel dipilih user saat registrasi (default: email)
    if (otpChannel === "whatsapp") {
      const message =
        `Berikut adalah kode OTP Anda\n${code}\n` +
        `Gunakan kode ini untuk verifikasi akun Anda. Berlaku 15 menit.\n\n` +
        `Jika Anda tidak melakukan registrasi, abaikan pesan ini.`;

      try {
        await sendWhatsApp({
          to: phoneNumber,
          message,
          clientReference: `otp-register-${newUser.id}`,
          idempotencyKey: `otp-register-${newUser.id}-${code}`,
        });
      } catch (err) {
        console.error(`[whatsapp] Failed to send OTP to ${phoneNumber}:`, err);
      }
    } else {
      try {
        await sendOtpEmail(email, code);
      } catch (err) {
        console.error(`[email] Failed to send OTP to ${email}:`, err);
      }
    }

    // 5. Issue unverified JWT
    const accessToken = await sign(
      {
        id: newUser.id,
        name: null,
        email: newUser.email,
        phoneNumber: newUser.phoneNumber,
        type: type === "mahasiswa" ? "mahasiswa" : "ota",
        provider: "keycloak",
        oid: ssoUserId,
        createdAt: newUser.createdAt,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
      },
      env.JWT_SECRET,
    );

    setCookie(c, "ota-ku.access-cookie", accessToken, {
      httpOnly: true,
      secure: env.COOKIE_SECURE,
      sameSite: "strict",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return c.json(
      {
        success: true,
        message: "User registered. Please verify your OTP.",
        body: { token: accessToken, id: newUser.id, email: newUser.email },
      },
      200,
    );
  } catch (error) {
    console.error(error);
    return c.json(
      { success: false, message: "Internal server error", error },
      500,
    );
  }
});

authRouter.openapi(oauthRoute, async (c) => {
  const body = await c.req.formData();
  const data = Object.fromEntries(body.entries());

  const zodParseResult = UserOAuthLoginRequestSchema.parse(data);
  const { code } = zodParseResult;

  // Exchange authorization code for tokens with Keycloak
  const tokenRes = await fetch(
    `${env.KEYCLOAK_ISSUER_URL}/protocol/openid-connect/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: env.KEYCLOAK_CLIENT_ID,
        client_secret: env.KEYCLOAK_CLIENT_SECRET,
        redirect_uri: env.KEYCLOAK_REDIRECT_URI,
      }),
    }
  );

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    console.error("[Keycloak OAuth] Token exchange failed:", err);
    return c.json({ success: false, message: "OAuth token exchange failed" }, 500);
  }

  const tokens = await tokenRes.json();
  const accessToken = tokens.access_token as string;
  const idToken = tokens.id_token as string | undefined;

  // Decode and validate the Keycloak token
  let payload: any;
  try {
    payload = await validateKeycloakToken(accessToken);
  } catch (err) {
    return c.json({ success: false, message: "Invalid Keycloak token" }, 401);
  }

  const sub   = payload.sub as string;            // Keycloak user UUID
  const email = payload.email as string;
  const name  = payload.name as string | undefined;
  const roles: string[] = payload.realm_access?.roles ?? [];

  const localRole = keycloakRoleToLocalRole(roles);
  const jwtType   = keycloakRoleToType(roles);

  try {
    let accountData = await prisma.user.findFirst({ where: { oid: sub } });

    if (!accountData) {
      // Fallback: try to find by email (existing user, first SSO login)
      accountData = await prisma.user.findFirst({ where: { email } });

      if (accountData) {
        // Migrate existing account to SSO
        accountData = await prisma.user.update({
          where: { id: accountData.id },
          data: { oid: sub, provider: "keycloak" as any, role: localRole as any },
        });
      } else {
        // First-ever login — create local record
        // Mahasiswa daftarkan diri via form biasa, bukan auto-verified via SSO
        const isPrivilegedRole = localRole !== "Mahasiswa";
        accountData = await prisma.user.create({
          data: {
            email,
            oid: sub,
            provider: "keycloak" as any,
            role: localRole as any,
            password: null,
            verificationStatus: isPrivilegedRole ? "verified" : "unverified",
          },
        });

        // If mahasiswa, create MahasiswaProfile from email NIM
        if (localRole === "Mahasiswa") {
          const nim = email.split("@")[0];
          await prisma.mahasiswaProfile.create({
            data: {
              userId: accountData.id,
              name: name ?? null,
              nim,
              major: getNimJurusanCodeMap()[nim.slice(0, 3)] ?? "TPB",
              faculty:
                getNimFakultasCodeMap()[
                  getNimFakultasFromNimJurusanMap()[nim.slice(0, 3)]
                ] ?? null,
            },
          });
        }
      }
    }

    // Block rejected users from logging in
    if (accountData.applicationStatus === "rejected") {
      return c.json(
        { success: false, message: "Akun anda telah ditolak oleh admin." },
        403,
      );
    }

    // Pengurus IOM registers via Bankes without a phone number, so they cannot
    // receive OTP via WhatsApp. Auto-verify them upon SSO login.
    // Use accountData.role (from DB) not localRole (from Keycloak token) since
    // Keycloak may not always return realm roles in the token payload.
    if (accountData.role === "Pengurus_IOM" && accountData.verificationStatus !== "verified") {
      accountData = await prisma.user.update({
        where: { id: accountData.id },
        data: { verificationStatus: "verified" },
      });
    }

    const localToken = await sign(
      {
        id: accountData.id,
        name: name ?? null,
        email: accountData.email,
        phoneNumber: accountData.phoneNumber ?? null,
        type: roleToJwtType(accountData.role),
        provider: "keycloak",
        oid: sub,
        createdAt: accountData.createdAt,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
      },
      env.JWT_SECRET,
    );

setCookie(c, "ota-ku.access-cookie", localToken, {
      httpOnly: true,
      secure: env.COOKIE_SECURE,
      sameSite: "strict",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    if (idToken) {
      setCookie(c, "ota-ku.id-token", idToken, {
        httpOnly: true,
        secure: env.COOKIE_SECURE,
        sameSite: "strict",
        maxAge: 60 * 60 * 24,
        path: "/",
      });
    }

    return c.json(
      { success: true, message: "Login successful", body: { token: localToken } },
      200,
    );
  } catch (error) {
    console.error(error);
    return c.json({ success: false, message: "Internal server error", error }, 500);
  }
});

authProtectedRouter.openapi(verifRoute, async (c) => {
  const user = c.var.user;
  // TODO: Update user session
  return c.json(
    {
      success: true,
      message: "User is authenticated",
      body: user,
    },
    200,
  );
});

authProtectedRouter.openapi(logoutRoute, async (c) => {
  const idToken = getCookie(c, "ota-ku.id-token");
  deleteCookie(c, "ota-ku.access-cookie");
  deleteCookie(c, "ota-ku.id-token");

  const postLogoutRedirect = encodeURIComponent(`${env.VITE_PUBLIC_URL}/auth/login`);
  const logoutUrl = idToken
    ? `${env.KEYCLOAK_ISSUER_URL}/protocol/openid-connect/logout?id_token_hint=${idToken}&post_logout_redirect_uri=${postLogoutRedirect}`
    : `${env.VITE_PUBLIC_URL}/auth/login`;

  return c.json(
    {
      success: true,
      message: "Logout successful",
      body: { logoutUrl },
    },
    200,
  );
});

authProtectedRouter.openapi(otpRoute, async (c) => {
  const user = c.var.user;
  const body = await c.req.formData();
  const data = Object.fromEntries(body.entries());

  const zodParseResult = OTPVerificationRequestSchema.parse(data);
  const { pin } = zodParseResult;

  const userAccount = await prisma.user.findFirst({
    where: { id: user.id },
  });

  if (userAccount?.verificationStatus === "verified") {
    return c.json(
      {
        success: false,
        message: "Account is already verified",
        error: "Account is already verified",
      },
      401,
    );
  }

  const currentDateTime = new Date(Date.now());

  const otp = await prisma.oTP.findFirst({
    where: {
      userId: user.id,
      code: pin,
      expiredAt: { gte: currentDateTime },
    },
  });

  if (!otp) {
    return c.json(
      {
        success: false,
        message: "No valid OTP not found",
        error: "No valid OTP not found",
      },
      404,
    );
  }

  try {
    await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: { verificationStatus: "verified" },
      });

      if (updatedUser.role === "Mahasiswa") {
        const nim = updatedUser.email.split("@")[0];
        await tx.mahasiswaProfile.upsert({
          where: { userId: user.id },
          update: {
            nim,
            major: getNimJurusanCodeMap()[nim.slice(0, 3)],
            faculty:
              getNimFakultasCodeMap()[
                getNimFakultasFromNimJurusanMap()[nim.slice(0, 3)]
              ],
          },
          create: {
            userId: user.id,
            nim,
            major: getNimJurusanCodeMap()[nim.slice(0, 3)],
            faculty:
              getNimFakultasCodeMap()[
                getNimFakultasFromNimJurusanMap()[nim.slice(0, 3)]
              ],
          },
        });
      }
    });

    const accessToken = await sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        type: user.type,
        provider: user.provider,
        oid: user.oid,
        createdAt: user.createdAt,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
      },
      env.JWT_SECRET,
    );

    setCookie(c, "ota-ku.access-cookie", accessToken, {
      httpOnly: true,
      secure: env.COOKIE_SECURE,
      sameSite: "strict",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return c.json(
      {
        success: true,
        message: "OTP found",
        body: {
          token: accessToken,
        },
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

authRouter.openapi(forgotPasswordRoute, async (c) => {
  const body = await c.req.formData();
  const data = Object.fromEntries(body.entries());

  const zodParseResult = ForgotPasswordSchema.parse(data);
  const { email } = zodParseResult;

  try {
    const foundAccount = await prisma.user.findFirst({
      where: {
        email,
        provider: "credentials",
      },
    });

    if (!foundAccount) {
      console.error("Invalid email");
      return c.json(
        {
          success: true,
          message:
            "Kata sandi sementara akan dikirim ke email Anda jika akun terdaftar",
        },
        200,
      );
    }

    const password = generateSecurePassword();

    await prisma.temporaryPassword.create({
      data: {
        userId: foundAccount.id,
        password: await hash(password, 10),
        expiredAt: new Date(Date.now() + 1000 * 60 * 15), // 15 minutes
      },
    });

    // Brevo SMTP relay - Gmail Workspace menolak App Password untuk akun ini
    // (535 5.7.8 Bad Credentials), dan opsi App Password tidak tersedia di
    // Admin Console organisasi. EMAIL/EMAIL_PASSWORD sekarang diisi login
    // & SMTP key dari dashboard Brevo, bukan kredensial Gmail.
    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      secure: false,
      port: 587,
      auth: {
        user: env.EMAIL,
        pass: env.EMAIL_PASSWORD,
      },
    });

    transporter.verify((error, success) => {
      if (error) {
        console.error("SMTP Server verification failed:", error);
      } else {
        console.log("SMTP Server is ready:", success);
      }
    });

    await transporter
      .sendMail({
        from: env.EMAIL_FROM,
        to: env.NODE_ENV !== "production" ? env.TEST_EMAIL : foundAccount.email,
        subject: "Kata Sandi Sementara Bantuan Orang Tua Asuh",
        html: forgotPasswordEmail(foundAccount.email, password),
      })
      .catch((error) => {
        console.error("Error sending email:", error);
      });

    return c.json(
      {
        success: true,
        message:
          "Kata sandi sementara akan dikirim ke email Anda jika akun terdaftar",
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
