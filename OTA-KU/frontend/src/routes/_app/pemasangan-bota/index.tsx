import Metadata from "@/components/metadata";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";

import { MahasiswaSelection } from "./-components/mahasiswa-selection";
import { OTA } from "./-components/ota-popover";
import { OTASelection } from "./-components/ota-selection";

export const Route = createFileRoute("/_app/pemasangan-bota/")({
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
  const [selectedOTA, setSelectedOTA] = useState<OTA | null>(null);
  const [resetState, setResetState] = useState(false);

  // Function to handle the success of Memasangkan ota dengan mahasiswa
  const handleConfirmSuccess = () => {
    setSelectedOTA(null);
    setResetState(true);
    setTimeout(() => setResetState(false), 0); // Reset the state immediately after re-render
  };

  return (
    <main className="flex min-h-[calc(100vh-70px)] flex-col gap-4 p-2 px-6 py-16 md:px-12 lg:min-h-[calc(100vh-96px)]">
      <Metadata title="Pemasangan OTA-Ku | OTA-Ku" />
      <h1 className="text-dark text-3xl font-bold md:text-[50px]">
        Pemasangan Bantuan Orang Tua Asuh
      </h1>
      {!resetState && (
        <>
          <OTASelection onSelectOTA={setSelectedOTA} />
          {selectedOTA && (
            <MahasiswaSelection
              selectedOTA={selectedOTA}
              onConfirmSuccess={handleConfirmSuccess}
            />
          )}
        </>
      )}
    </main>
  );
}
