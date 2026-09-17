import { api } from "@/api/client";
import { groupService } from "@/api/groupService";
import Metadata from "@/components/metadata";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { UserX } from "lucide-react";

import DetailCardsOrangTuaAsuh from "./-components/detail-card";
import GrupCard from "./-components/grup-card";

export const Route = createFileRoute("/_app/orang-tua-asuh-saya/")({
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
      .getVerificationStatus({
        id: user.id,
      })
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

    if (
      applicationStatus.body.status !== "accepted" &&
      applicationStatus.body.status !== "reapply"
    ) {
      throw redirect({ to: "/" });
    }

    return { user };
  },
});

function RouteComponent() {
  const { user } = Route.useRouteContext();
  const { data } = useQuery({
    queryKey: ["getMyOtaDetail", user.id],
    queryFn: () => api.detail.getMyOtaDetail(),
  });

  const { data: grupData, isLoading: isGrupLoading } = useQuery({
    queryKey: ["getMaOtaGroups"],
    queryFn: () => groupService.getMaOtaGroups(),
  });

  const hasOta = data?.body && Object.keys(data.body).length > 0;
  const hasGrup = grupData && grupData.length > 0;
  const isEmpty = !hasOta && !isGrupLoading && !hasGrup;

  return (
    <main className="flex min-h-[calc(100vh-70px)] flex-col items-center p-2 px-6 py-8 md:px-12 lg:min-h-[calc(100vh-96px)]">
      <Metadata title="Orang Tua Asuh Saya | BOTA" />
      <h1 className="text-primary mb-4 text-2xl font-bold">
        Orang Tua Asuh Saya
      </h1>

      {isEmpty ? (
        <div className="flex w-full max-w-[300px] flex-col items-center justify-center gap-4">
          <div className="mb-4 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-gray-100">
            <UserX className="h-12 w-12 text-gray-400" />
          </div>
          <h2 className="text-lg font-bold">Belum ada orang tua asuh</h2>
        </div>
      ) : (
        <div className="flex w-full max-w-sm flex-col gap-6">
          {hasOta && (
            <DetailCardsOrangTuaAsuh
              id={data.body.id || "-"}
              name={data.body.name || "-"}
              email={data.body.email || "-"}
              phoneNumber={data.body.phoneNumber || "-"}
              transferDate={data.body.transferDate || 0}
              createdAt={data.body.createdAt || "-"}
              isDetailVisible={data.body.isDetailVisible || false}
            />
          )}

          {(isGrupLoading || hasGrup) && (
            <div className="flex flex-col gap-3">
              <h2 className="text-lg font-bold text-primary">Grup OTA</h2>
              {isGrupLoading ? (
                <Skeleton className="h-16 w-full" />
              ) : (
                grupData!.map((grup) => (
                  <GrupCard key={grup.groupId} grup={grup} />
                ))
              )}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
