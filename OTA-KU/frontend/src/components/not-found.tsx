import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/context/sidebar";
import { Link } from "@tanstack/react-router";
import { Home } from "lucide-react";

import NavBar from "./navbar";
import SessionProvider from "./session";
import Metadata from "./metadata";

export function NotFound() {
  return (
    <SessionProvider>
      <SidebarProvider>
        <NavBar />
        <main className="flex h-full min-h-[calc(100vh-70px)] w-full items-center justify-center lg:min-h-[calc(100vh-96px)]">
          <Metadata title="Halaman Tidak Ditemukan | BOTA" />

          <div className="mx-auto flex h-full max-w-md flex-col items-center px-4 text-center">
            <h1 className="text-5xl font-bold tracking-tighter text-primary">
              404
            </h1>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-primary">
              Halaman Tidak Ditemukan
            </h2>
            <p className="mt-4 mb-6 text-gray-600 md:text-xl/relaxed">
              Maaf, halaman yang Anda cari tidak dapat ditemukan. Halaman
              mungkin telah dipindahkan atau dihapus.
            </p>
            <Link to="/">
              <Button className="bg-primary text-white hover:bg-primary-hover">
                <Home className="mr-2 h-4 w-4" />
                Kembali ke Beranda
              </Button>
            </Link>
          </div>
        </main>
      </SidebarProvider>
    </SessionProvider>
  );
}
