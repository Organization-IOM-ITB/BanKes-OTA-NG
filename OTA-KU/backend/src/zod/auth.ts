import { z } from "@hono/zod-openapi";

import {
  EmailSchema,
  PasswordSchema,
  PhoneNumberSchema,
  TokenSchema,
  validNimPrefixes,
} from "./atomic.js";

// Login
export const UserLoginRequestSchema = z
  .object({
    identifier: z
      .union([EmailSchema, PhoneNumberSchema], {
        message: "Harus berupa email atau nomor telepon",
      })
      .openapi({
        examples: ["johndoe@example.com", "081234567890"],
      }),
    password: PasswordSchema,
  })
  .openapi("UserLoginRequestSchema");

export const UserOAuthLoginRequestSchema = z.object({
  code: z.string().openapi({
    example: "1.AXIAgxFu22VM...",
    description: "OAuth code for authentication.",
  }),
});

export const SuccessfulLoginResponse = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z.string().openapi({ example: "Login successful" }),
  body: z.object({
    token: TokenSchema,
  }),
});

export const InvalidLoginResponse = z.object({
  success: z.boolean().openapi({ example: false }),
  message: z.string().openapi({ example: "Invalid credentials" }),
  error: z.string().openapi({ example: "Password comparison failed" }),
});

export const BadRequestLoginResponse = z.object({
  success: z.boolean().openapi({ example: false }),
  message: z.string().openapi({ example: "Missing required fields" }),
  error: z.string().openapi({ example: "Username and password are required" }),
});

export const BadRequestOAuthLoginResponse = z.object({
  success: z.boolean().openapi({ example: false }),
  message: z.string().openapi({ example: "Missing required fields" }),
  error: z.string().openapi({ example: "Code is required" }),
});

// Register
export const UserRegisRequestSchema = z
  .object({
    type: z
      .enum(["mahasiswa", "ota"], {
        message: "Tipe tidak valid",
      })
      .openapi({
        example: "mahasiswa",
        description: "The user's type.",
      }),
    email: EmailSchema,
    phoneNumber: PhoneNumberSchema,
    password: PasswordSchema,
    confirmPassword: PasswordSchema,
    otpChannel: z
      .enum(["email", "whatsapp"], {
        message: "Metode verifikasi tidak valid",
      })
      .default("email")
      .openapi({
        example: "email",
        description: "Channel used to deliver the registration OTP.",
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi password gagal",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => {
      if (data.type === "mahasiswa") {
        const match = data.email.match(
          /^(\d{3})(\d{5})@mahasiswa\.itb\.ac\.id$/,
        );
        if (!match) return false;

        const nimPrefix = match[1];
        return validNimPrefixes.has(nimPrefix);
      }
      return true;
    },
    {
      message: "Email harus sesuai format NIM@mahasiswa.itb.ac.id",
      path: ["email"],
    },
  )
  .openapi("UserRegisRequestSchema");

export const SuccessfulRegisResponse = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z.string().openapi({ example: "Authenticated" }),
  body: z.object({
    token: TokenSchema,
    id: z.string().openapi({
      example: "3762d870-158e-4832-804c-f0be220d40c0",
      description: "Unique account ID",
    }),
    email: z.string().openapi({
      example: "johndoe@example.com",
      description: "The user's email.",
    }),
  }),
});

export const BadRequestRegisResponse = z.object({
  success: z.boolean().openapi({ example: false }),
  message: z.string().openapi({ example: "Missing password" }),
  error: z.object({}),
});

export const InvalidRegisResponse = z.object({
  success: z.boolean().openapi({ example: false }),
  message: z.string().openapi({ example: "Invalid email" }),
  error: z.object({}),
});

// Verify
export const UserAuthenticatedResponse = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z.string().openapi({ example: "Authenticated" }),
  body: z
    .object({
      id: z.string().openapi({ example: "1" }),
      name: z.string().nullable().openapi({ example: "John Doe" }),
      email: z.string().openapi({ example: "johndoe@example.com" }),
      phoneNumber: z.string().nullable().openapi({ example: "081234567890" }),
      type: z
        .enum(["mahasiswa", "ota", "admin", "bankes", "pengurus"])
        .openapi({ example: "mahasiswa" }),
      provider: z
            .enum(["credentials", "azure", "keycloak"])
            .openapi({ example: "credentials" }),
      oid: z.string().nullable().openapi({ example: "1" }),
      createdAt: z.string().openapi({ example: "2023-10-01T00:00:00.000Z" }),
      iat: z.number().openapi({ example: 1630000000 }),
      exp: z.number().openapi({ example: 1630000000 }),
    })
    .openapi("UserSchema"),
});

export const UserNotAuthenticatedResponse = z.object({
  success: z.boolean().openapi({ example: false }),
  message: z.string().openapi({ example: "Unauthenticated" }),
});

// Logout
export const LogoutSuccessfulResponse = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z.string().openapi({ example: "Logout successful" }),
  body: z.object({
    logoutUrl: z.string().openapi({ example: "https://sso.example.com/realms/iom/protocol/openid-connect/logout?..." }),
  }),
});

// JWT
export const JWTPayloadSchema = z
  .object({
    id: z.string().openapi({ example: "1" }),
    name: z.string().nullable().openapi({ example: "John Doe" }),
    email: z.string().openapi({ example: "johndoe@example.com" }),
    phoneNumber: z.string().nullable().openapi({ example: "081234567890" }),
    type: z
      .enum(["mahasiswa", "ota", "admin", "bankes", "pengurus"])
      .openapi({ example: "mahasiswa" }),
    provider: z
      .enum(["credentials", "azure", "keycloak"])
      .openapi({ example: "credentials" }),
    oid: z.string().nullable().openapi({ example: "1" }),
    createdAt: z.string().openapi({ example: "2023-10-01T00:00:00.000Z" }),
    iat: z.number().openapi({ example: 1630000000 }),
    exp: z.number().openapi({ example: 1630000000 }),
  })
  .openapi("JWTPayloadSchema");

// OTP
export const OTPVerificationRequestSchema = z.object({
  pin: z.string().length(6, {
    message: "Kode OTP harus terdiri dari 6 karakter.",
  }),
});

export const SuccessfulOTPVerificationResponse = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z.string().openapi({ example: "OTP verification successful" }),
  body: z.object({
    token: TokenSchema,
  }),
});

export const BadRequestOTPVerificationResponse = z.object({
  success: z.boolean().openapi({ example: false }),
  message: z.string().openapi({ example: "Missing required fields" }),
  error: z.string().openapi({ example: "OTP is required" }),
});

// Forgot Password
export const ForgotPasswordSchema = z.object({
  email: EmailSchema,
});

export const ForgotPasswordResponse = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z.string().openapi({ example: "Forgot password email sent" }),
});
