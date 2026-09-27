import Metadata from "@/components/metadata";
import { createFileRoute, redirect } from "@tanstack/react-router";

import { DaftarTransferMahasiswaContent } from "./-components/daftar-transfer-mahasiswa-content";

export const Route = createFileRoute("/_app/daftar-transfer-mahasiswa/")({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    const user = context.session;

    if (!user) {
      throw redirect({ to: "/auth/login" });
    }

    if (user.type === "mahasiswa" || user.type === "ota") {
      throw redirect({ to: "/" });
    }

    return { user };
  },
});

function RouteComponent() {
  return (
    <main className="flex min-h-[calc(100vh-70px)] flex-col gap-4 p-2 px-6 py-16 md:px-12 lg:min-h-[calc(100vh-96px)]">
      <Metadata title="Daftar Transfer Mahasiswa | OTA-Ku" />
      <DaftarTransferMahasiswaContent />
    </main>
  );
}
