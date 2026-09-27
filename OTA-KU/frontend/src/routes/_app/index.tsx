import Metadata from "@/components/metadata";
import { createFileRoute } from "@tanstack/react-router";

import LandingPage from "./-components/landing-page";
import ReapplyModal from "./-components/reapply-modal";

export const Route = createFileRoute("/_app/")({
  component: Index,
  loader: async ({ context }) => {
    return { session: context.session };
  },
});

function Index() {
  const { session } = Route.useLoaderData();

  return (
    <main className="flex min-h-[calc(100vh-70px)] flex-col items-center justify-center px-4 py-8 text-4xl md:px-12 lg:min-h-[calc(100vh-96px)]">
      <Metadata title="Beranda | OTA-Ku" />
      <LandingPage session={session} />

      {/* Reapply Modal */}
      {session?.type === "mahasiswa" && <ReapplyModal session={session} />}
    </main>
  );
}
