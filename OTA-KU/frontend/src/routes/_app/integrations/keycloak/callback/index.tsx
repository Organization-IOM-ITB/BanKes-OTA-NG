import { api, queryClient } from "@/api/client";
import Metadata from "@/components/metadata";
import { getApiErrorMessage } from "@/lib/api-error";
import { consumeKeycloakState } from "@/lib/keycloak";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

export const Route = createFileRoute(
  "/_app/integrations/keycloak/callback/",
)({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    const user = context.session;

    if (user) {
      throw redirect({ to: "/" });
    }
  },
});

function RouteComponent() {
  const navigate = useNavigate();
  const handled = useRef(false);

  useEffect(() => {
    // Authorization code hanya bisa ditukar sekali; cegah eksekusi ganda (StrictMode).
    if (handled.current) return;
    handled.current = true;

    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");

    const fail = (reason: string) => {
      window.location.replace(
        `${import.meta.env.BASE_URL}auth/login?sso_error=${encodeURIComponent(reason)}`,
      );
    };

    if (error) {
      fail(url.searchParams.get("error_description") ?? error);
      return;
    }

    if (!code) {
      fail("Kode otorisasi tidak ditemukan.");
      return;
    }

    if (!consumeKeycloakState(state)) {
      fail("Sesi login tidak valid atau kedaluwarsa. Silakan coba lagi.");
      return;
    }

    api.auth
      .oauth({
        formData: { code },
      })
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ["verify"] });
        navigate({ to: "/", reloadDocument: true });
      })
      .catch((err) => {
        console.error(err);
        fail(
          getApiErrorMessage(err, "Gagal memproses login SSO. Silakan coba lagi."),
        );
      });
  }, [navigate]);

  return (
    <div className="flex min-h-[calc(100vh-70px)] items-center justify-center">
      <Metadata title="Login | BOTA" />
      <div className="flex flex-col items-center gap-4">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
        <p className="text-primary text-lg">Sedang memproses login SSO...</p>
      </div>
    </div>
  );
}
