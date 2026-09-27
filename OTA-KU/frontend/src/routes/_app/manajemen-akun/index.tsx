import Metadata from "@/components/metadata";
import { createFileRoute, redirect } from "@tanstack/react-router";

import ManajemenAkunContent from "./-components/manajemen-akun-content";

export const Route = createFileRoute("/_app/manajemen-akun/")({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    const user = context.session;

    if (!user) {
      throw redirect({ to: "/auth/login" });
    }

    if (user.type !== "admin") {
      throw redirect({ to: "/" });
    }

    return { user };
  },
});

function RouteComponent() {
  return (
    <main className="flex min-h-[calc(100vh-70px)] flex-col gap-4 p-2 px-6 py-16 md:px-12 lg:min-h-[calc(100vh-96px)]">
      <Metadata title="Manajemen Akun | OTA-Ku" />
      <h1 className="text-dark text-3xl font-bold md:text-[50px]">
        Manajemen Akun
      </h1>
      <ManajemenAkunContent />
    </main>
  );
}
