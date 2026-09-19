import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import {
  validateEmail, 
  validatePassword, 
  
} from "@/utils/_validation";

import { prisma } from "@/lib/prisma";

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

    // NOTE: Akun Keycloak SENGAJA belum dibuat di sini. Selama user masih
    // berstatus Guest/pending, dia tidak boleh punya role apa pun di realm SSO
    // bersama — app lain (OTA-KU, moki-ng, dst.) langsung mempercayai role
    // Keycloak tanpa tahu soal status approval Bankes. Akun Keycloak baru
    // dibuat saat admin approve (lihat /api/admin/users/approve), dengan role
    // final yang sudah admin tentukan.
    const newUser = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        password: hashedPassword,
        role: "Guest",
        provider: "credentials",
      }
    });

    if (!newUser) {
      errors.general = ["Failed to create user"];
      return NextResponse.json(errors, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Akun berhasil dibuat. Silahkan tunggu persetujuan admin sebelum dapat login.",
      user: {
        id: newUser.id,
        email: normalizedEmail,
        name,
        role: "Guest",
        status: "Menunggu persetujuan admin"
      }
    }, { status: 201 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create user." }, { status: 500 });
  }
}
