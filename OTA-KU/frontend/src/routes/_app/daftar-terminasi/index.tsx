import Metadata from "@/components/metadata";
import { createFileRoute, redirect } from "@tanstack/react-router";

import TerminasiPage from "./-components/terminasi-page";

export const Route = createFileRoute("/_app/daftar-terminasi/")({
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
      <Metadata title="Daftar Terminasi | OTA-Ku" />
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-dark text-3xl font-bold md:text-[50px]">
          Daftar Terminasi OTA
        </h1>
      </div>

      <TerminasiPage />
    </main>
  );
}
