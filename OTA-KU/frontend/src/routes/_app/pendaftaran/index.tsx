import { api } from "@/api/client";
import Metadata from "@/components/metadata";
import { Navigate, createFileRoute, redirect } from "@tanstack/react-router";

import PendaftaranMahasiswa from "./-components/pendaftaran-mahasiswa";
import PendaftaranOrangTua from "./-components/pendaftaran-orang-tua";

export const Route = createFileRoute("/_app/pendaftaran/")({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    const user = context.session;

    if (!user) {
      throw redirect({ to: "/auth/login" });
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
      applicationStatus.body.status === "accepted" ||
      applicationStatus.body.status === "reapply"
    ) {
      throw redirect({ to: "/profile" });
    }

    return { session: user, applicationStatus: applicationStatus.body.status };
  },
  loader: ({ context }) => {
    return {
      session: context.session,
      applicationStatus: context.applicationStatus,
    };
  },
});

function RouteComponent() {
  const { session, applicationStatus } = Route.useLoaderData();

  const isAdmin = session.type === "admin";

  if (isAdmin) {
    return <Navigate to="/" />;
  }

  // TODO: Sesuaiin datanya sesuai apa yang diinginkan IOM nanti
  if (applicationStatus === "pending") {
    return (
      <main className="flex min-h-[calc(100vh-70px)] flex-col gap-4 p-2 px-6 py-16 md:px-12 lg:min-h-[calc(100vh-96px)]">
        <Metadata title="Pendaftaran | OTA-Ku" />
        <h1 className="text-primary text-center text-2xl font-bold">
          Anda sudah mendaftar
        </h1>
        <p className="mt-4 text-center text-lg">
          Pendaftaran akan diproses selama dua hari maksimal. Jika sudah
          melewati waktu tersebut, silakan hubungi WhatsApp{" "}
          <a
            href="https://wa.me/6285624654990"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            +62 856-2465-4990
          </a>
          .
        </p>
      </main>
    );
  }

  if (applicationStatus === "rejected") {
    return (
      <main className="flex min-h-[calc(100vh-70px)] flex-col gap-4 p-2 px-6 py-16 md:px-12 lg:min-h-[calc(100vh-96px)]">
        <Metadata title="Pendaftaran | OTA-Ku" />
        <h1 className="text-primary text-center text-2xl font-bold">
          Maaf, pendaftaran anda ditolak
        </h1>
        <p className="mt-4 text-center text-lg">
          Maaf pendaftaran anda ditolak oleh pengurus OTA-Ku (admin) karena suatu
          alasan. Jika terdapat kesalahan, silakan hubungi WhatsApp{" "}
          <a
            href="https://wa.me/6285624654990"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            +62 856-2465-4990
          </a>
          .
        </p>
      </main>
    );
  }

  return session.type === "mahasiswa" ? (
    <PendaftaranMahasiswa
      session={session}
      applicationStatus={applicationStatus}
    />
  ) : (
    <PendaftaranOrangTua />
  );
}
