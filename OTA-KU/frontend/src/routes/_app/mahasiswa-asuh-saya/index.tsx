import { api } from "@/api/client";
import { ClientPagination } from "@/components/client-pagination";
import Metadata from "@/components/metadata";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  redirect,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";
import { useDebounce } from "use-debounce";

import MahasiswaCard from "./-components/mahasiswa-card";

export const Route = createFileRoute("/_app/mahasiswa-asuh-saya/")({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    const user = context.session;

    if (!user) {
      throw redirect({ to: "/auth/login" });
    }

    if (user.type !== "ota") {
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

    if (applicationStatus.body.status !== "accepted") {
      throw redirect({ to: "/" });
    }

    return { user };
  },
});

function RouteComponent() {
  const navigate = useNavigate({ from: Route.fullPath });
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery] = useDebounce(searchQuery, 500);

  const page = parseInt(searchParams.get("page") ?? "1") || 1;

  const { data: activeStudentsData, isSuccess: isActiveSuccess } = useQuery({
    queryKey: ["listMaActive", debouncedSearchQuery],
    queryFn: () =>
      api.list.listMaActive({
        q: debouncedSearchQuery,
        page,
      }),
  });

  const { data: pendingStudentsData, isSuccess: isPendingSuccess } = useQuery({
    queryKey: ["listMaPending", debouncedSearchQuery],
    queryFn: () =>
      api.list.listMaPending({
        q: debouncedSearchQuery,
        page,
      }),
  });

  return (
    <main className="flex min-h-[calc(100vh-70px)] flex-col p-2 px-6 py-8 md:px-12 lg:min-h-[calc(100vh-96px)]">
      <Metadata title="Mahasiswa Asuh Saya | BOTA" />
      <h1 className="mb-6 text-3xl font-bold text-primary">
        Mahasiswa Asuh Saya
      </h1>

      <Tabs defaultValue="aktif" className="flex w-full flex-col gap-4">
        <TabsList className="w-full bg-placeholder">
          <TabsTrigger
            value="aktif"
            className="data-[state=active]:text-dark text-base font-bold text-white data-[state=active]:bg-white"
            onClick={() => {
              navigate({ search: () => ({ page: 1 }) });
            }}
          >
            Aktif
          </TabsTrigger>
          <TabsTrigger
            value="menunggu"
            className="data-[state=active]:text-dark text-base font-bold text-white data-[state=active]:bg-white"
            onClick={() => {
              navigate({ search: () => ({ page: 1 }) });
            }}
          >
            Menunggu
          </TabsTrigger>
        </TabsList>

        <TabsContent value="aktif" className="flex flex-col gap-6">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Cari nama"
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {!isActiveSuccess ? (
            <Skeleton className="h-80 w-full" />
          ) : activeStudentsData.body.data.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {activeStudentsData.body.data.map((student, index) => (
                <MahasiswaCard key={index} mahasiswa={student} />
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground py-8 text-center">
              Tidak ada mahasiswa yang sedang diasuh
            </div>
          )}

          <ClientPagination
            total={activeStudentsData?.body.totalData ?? 0}
            totalPerPage={6}
          />
        </TabsContent>

        <TabsContent value="menunggu" className="flex flex-col gap-6">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Cari nama"
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {!isPendingSuccess ? (
            <Skeleton className="h-80 w-full" />
          ) : pendingStudentsData.body.data.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pendingStudentsData.body.data.map((student, index) => (
                <MahasiswaCard key={index} mahasiswa={student} />
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground py-8 text-center">
              Tidak ada mahasiswa yang sedang menunggu untuk diasuh
            </div>
          )}

          <ClientPagination
            total={pendingStudentsData?.body.totalData ?? 0}
            totalPerPage={6}
          />
        </TabsContent>
      </Tabs>
    </main>
  );
}
