// src/types/index.ts
export enum Role {
    Admin = "Admin", 
    Mahasiswa = "Mahasiswa", 
    Guest = "Guest", 
    Pengurus_IOM = "Pengurus_IOM",
  }
  
export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  verificationStatus?: "verified" | "unverified";
}

export type Profile = {
  email: string; 
  password: string; 
  redirect: boolean; 
}