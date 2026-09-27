import { api, queryClient } from "@/api/client";
import Metadata from "@/components/metadata";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute(
  "/_app/integrations/azure-key-vault/oauth2/callback/",
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

  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");

    if (!code || !state) {
      return;
    }

    if (state === localStorage.getItem("state")) {
      localStorage.removeItem("state");
      api.auth
        .oauth({
          formData: { code },
        })
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ["verify"] });
          navigate({ to: "/", reloadDocument: true });
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, [navigate]);

  return (
    <div>
      <Metadata title="Login | OTA-Ku" />
      Waiting to redirect
    </div>
  );
}
