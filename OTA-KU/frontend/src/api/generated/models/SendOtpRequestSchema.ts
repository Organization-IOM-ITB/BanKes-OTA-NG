/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type SendOtpRequestSchema = {
  /**
   * The user's email.
   */
  email: string;
  /**
   * Channel used to deliver the OTP.
   */
  otpChannel: 'email' | 'whatsapp';
};

