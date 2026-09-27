import Metadata from "@/components/metadata";
import { createFileRoute, redirect } from "@tanstack/react-router";

import ModerasiTestimoniContent from "./-components/moderasi-testimoni-content";

export const Route = createFileRoute("/_app/moderasi-testimoni/")({
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
      <Metadata title="Moderasi Testimoni | OTA-Ku" />
      <h1 className="text-dark text-3xl font-bold md:text-[50px]">Moderasi Testimoni</h1>
      <ModerasiTestimoniContent />
    </main>
  );
}
