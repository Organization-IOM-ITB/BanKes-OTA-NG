import { z } from "@hono/zod-openapi";

import { EmailSchema } from "./atomic.js";

// Send OTP
export const SendOtpRequestSchema = z
  .object({
    email: EmailSchema,
    otpChannel: z
      .enum(["email", "whatsapp"], {
        message: "Metode verifikasi tidak valid",
      })
      .default("email")
      .openapi({
        example: "email",
        description: "Channel used to deliver the OTP.",
      }),
  })
  .openapi("SendOtpRequestSchema");

export const SendOtpResponseSchema = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z.string().openapi({ example: "OTP sent successfully" }),
});

export const BadRequestSendOtpResponse = z.object({
  success: z.boolean().openapi({ example: false }),
  message: z.string().openapi({ example: "Missing required fields" }),
  error: z.object({}),
});

export const EmailNotFoundResponseSchema = z.object({
  success: z.boolean().openapi({ example: false }),
  message: z.string().openapi({ example: "User not found" }),
  error: z.object({}),
});

// Get OTP Expired Date
export const GetOtpExpiredDateResponseSchema = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z
    .string()
    .openapi({ example: "OTP expired date retrieved successfully" }),
  expiredAt: z.string().openapi({ example: "2023-10-01T12:00:00Z" }),
});

export const GetOtpExpiredDateNotFoundResponseSchema = z.object({
  success: z.boolean().openapi({ example: false }),
  message: z.string().openapi({ example: "OTP not found" }),
  error: z.object({}),
});

export const GetOtpExpiredDateResponseSchemaError = z.object({
  success: z.boolean().openapi({ example: false }),
  message: z
    .string()
    .openapi({ example: "Failed to retrieve OTP expired date" }),
  error: z.object({}),
});
