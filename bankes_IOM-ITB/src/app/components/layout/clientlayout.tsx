"use client";

import { SessionProvider } from "next-auth/react";
import Navbar from "./navbar";
import Footer from "./footer";
import AppSelectorFab from "./AppSelectorFab";
import { UserProvider } from "@/app/contexts/UserContext";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <UserProvider>
        <main className="flex-grow">{children}</main>
        <Footer />
        <AppSelectorFab />
      </UserProvider>
    </SessionProvider>
  );
}