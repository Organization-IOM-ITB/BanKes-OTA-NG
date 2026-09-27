import { api } from "@/api/client";
import { groupService } from "@/api/groupService";
import Metadata from "@/components/metadata";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { UserX } from "lucide-react";

import TestimoniForm from "./-components/testimoni-form";

export const Route = createFileRoute("/_app/testimoni/")({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    const user = context.session;

    if (!user) {
      throw redirect({ to: "/auth/login" });
    }

    if (user.type !== "mahasiswa") {
      throw redirect({ to: "/" });
    }

    const verificationStatus = await api.status
      .getVerificationStatus({ id: user.id })
      .catch(() => null);

    if (!verificationStatus) {
      throw redirect({ to: "/auth/login" });
    }

    if (verificationStatus.body.status !== "verified") {
      throw redirect({ to: "/auth/otp-verification" });
    }

    const applicationStatus = await api.status
      .getApplicationStatus({ id: user.id })
      .catch(() => null);

    if (!applicationStatus) {
      throw redirect({ to: "/auth/login" });
    }

    if (applicationStatus.body.status !== "accepted") {
      throw redirect({ to: "/" });
    }

    return { user };
  },
});

function RouteComponent() {
  const { user } = Route.useRouteContext();
  const { data, isPending: isOtaPending } = useQuery({
    queryKey: ["getMyOtaDetail", user.id],
    queryFn: () => api.detail.getMyOtaDetail(),
  });

  const { data: grupData, isPending: isGrupPending } = useQuery({
    queryKey: ["getMaOtaGroups"],
    queryFn: () => groupService.getMaOtaGroups(),
  });

  const isPending = isOtaPending || isGrupPending;
  const hasOta = Boolean(data?.body?.id) || (grupData?.length ?? 0) > 0;

  return (
    <main className="flex min-h-[calc(100vh-70px)] flex-col gap-4 p-2 px-6 py-16 md:px-12 lg:min-h-[calc(100vh-96px)]">
      <Metadata title="Testimoni Saya | OTA-Ku" />
      <h1 className="text-dark text-3xl font-bold md:text-[50px]">Testimoni Saya</h1>
      {isPending ? (
        <Skeleton className="h-[320px] w-full rounded-xl" />
      ) : !hasOta ? (
        <div className="flex w-full flex-col items-center justify-center gap-4 py-16">
          <div className="mb-4 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-gray-100">
            <UserX className="h-12 w-12 text-gray-400" />
          </div>
          <h2 className="text-lg font-bold">Anda belum memiliki OTA</h2>
          <p className="text-muted-foreground text-sm">Testimoni hanya dapat diisi setelah Anda memiliki orang tua asuh.</p>
        </div>
      ) : (
        <TestimoniForm />
      )}
    </main>
  );
}
