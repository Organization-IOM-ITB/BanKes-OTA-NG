import { api } from "@/api/client";
import Metadata from "@/components/metadata";
import { createFileRoute, redirect } from "@tanstack/react-router";

import TransactionStatusContent from "./-components/transaction-status-content";

export const Route = createFileRoute("/_app/status-transaksi/")({
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
  return (
    <main className="flex min-h-[calc(100vh-70px)] flex-col gap-4 p-2 px-6 py-16 md:px-12 lg:min-h-[calc(100vh-96px)]">
      <Metadata title="Status Transaksi | OTA-Ku" />
      <h1 className="text-dark text-3xl font-bold md:text-[50px]">
        Status Transaksi
      </h1>
      <TransactionStatusContent />
    </main>
  );
}
