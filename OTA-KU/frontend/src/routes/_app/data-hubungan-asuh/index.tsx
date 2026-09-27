import Metadata from "@/components/metadata";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createFileRoute, redirect } from "@tanstack/react-router";

import DataHubunganAsuhContent from "./-components/data-hubungan-asuh-content";
import DataHubunganGrupContent from "./-components/data-hubungan-grup-content";

export const Route = createFileRoute("/_app/data-hubungan-asuh/")({
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
      <Metadata title="Data Hubungan Asuh | OTA-Ku" />
      <h1 className="text-dark text-3xl font-bold md:text-[50px]">
        Data Hubungan Asuh
      </h1>
      
      <Tabs defaultValue="individual" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="individual">Hubungan Individual</TabsTrigger>
          <TabsTrigger value="group">Hubungan Grup</TabsTrigger>
        </TabsList>
        
        <TabsContent value="individual" className="mt-6">
          <DataHubunganAsuhContent />
        </TabsContent>
        
        <TabsContent value="group" className="mt-6">
          <DataHubunganGrupContent />
        </TabsContent>
      </Tabs>
    </main>
  );
}
