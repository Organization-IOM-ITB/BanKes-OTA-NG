/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type UserRegisRequestSchema = {
  /**
   * The user's type.
   */
  type: 'mahasiswa' | 'ota';
  /**
   * The user's email.
   */
  email: string;
  /**
   * Nomor telepon pengguna yang dimulai dengan 62.
   */
  phoneNumber: string;
  /**
   * Password minimal 8 karakter, mengandung huruf besar, huruf kecil, angka, dan simbol.
   * Simbol yang diperbolehkan: ! @ # $ % ^ & * ( ) _ - + = [ ] { } ; ' : " \ | , . < > / ?
   */
  password: string;
  /**
   * Password minimal 8 karakter, mengandung huruf besar, huruf kecil, angka, dan simbol.
   * Simbol yang diperbolehkan: ! @ # $ % ^ & * ( ) _ - + = [ ] { } ; ' : " \ | , . < > / ?
   */
  confirmPassword: string;
  /**
   * Channel used to deliver the registration OTP.
   */
  otpChannel: 'email' | 'whatsapp';
};

