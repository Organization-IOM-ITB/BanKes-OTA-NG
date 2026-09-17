import Metadata from "@/components/metadata";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import MahasiswaAsuhContent from "./-components/mahasiswa-asuh-content";
import OrangTuaAsuhContent from "./-components/orang-tua-asuh-content";

export const Route = createFileRoute("/_app/verifikasi-akun/")({
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
  const navigate = useNavigate({ from: Route.fullPath });

  const [value, setValue] = useState("mahasiswa");

  return (
    <main className="flex min-h-[calc(100vh-70px)] flex-col gap-4 p-2 px-6 py-16 md:px-12 lg:min-h-[calc(100vh-96px)]">
      <Metadata title="Verifikasi Akun | BOTA" />
      {value === "mahasiswa" ? (
        <h1 className="text-dark text-3xl font-bold md:text-[50px]">
          Verifikasi Pendaftaran Mahasiswa Asuh
        </h1>
      ) : (
        <h1 className="text-dark text-3xl font-bold md:text-[50px]">
          Verifikasi Pendaftaran Orang Tua Asuh
        </h1>
      )}
      <Tabs defaultValue="mahasiswa" className="flex w-full flex-col gap-4">
        <TabsList className="w-full bg-placeholder">
          <TabsTrigger
            value="mahasiswa"
            className="data-[state=active]:text-dark text-base font-bold text-white data-[state=active]:bg-white"
            onClick={() => {
              setValue("mahasiswa");
              navigate({ search: () => ({ page: 1 }) });
            }}
          >
            Mahasiswa Asuh
          </TabsTrigger>
          <TabsTrigger
            value="ota"
            className="data-[state=active]:text-dark text-base font-bold text-white data-[state=active]:bg-white"
            onClick={() => {
              setValue("ota");
              navigate({ search: () => ({ page: 1 }) });
            }}
          >
            Orang Tua Asuh
          </TabsTrigger>
        </TabsList>
        <TabsContent value="mahasiswa">
          <MahasiswaAsuhContent />
        </TabsContent>
        <TabsContent value="ota">
          <OrangTuaAsuhContent />
        </TabsContent>
      </Tabs>
    </main>
  );
}
