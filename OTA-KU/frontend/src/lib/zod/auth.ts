import { z } from "zod";

import {
  EmailSchema,
  PasswordSchema,
  PhoneNumberSchema,
  validNimPrefixes,
} from "./atomic";

export const UserLoginRequestSchema = z.object({
  identifier: z.union([EmailSchema, PhoneNumberSchema], {
    message: "Harus berupa email atau nomor telepon",
  }),
  password: PasswordSchema,
});

export const UserRegisRequestSchema = z
  .object({
    type: z.enum(["mahasiswa", "ota"], {
      message: "Tipe tidak valid",
    }),
    email: EmailSchema,
    phoneNumber: PhoneNumberSchema,
    password: PasswordSchema,
    confirmPassword: PasswordSchema,
    otpChannel: z.enum(["email", "whatsapp"], {
      message: "Metode verifikasi tidak valid",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Kata sandi tidak cocok",
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
  );

export const OTPVerificationRequestSchema = z.object({
  pin: z.string().min(6, {
    message: "Kode OTP harus terdiri dari 6 karakter.",
  }),
});

// Forgot Password
export const ForgotPasswordSchema = z.object({
  email: EmailSchema,
});
