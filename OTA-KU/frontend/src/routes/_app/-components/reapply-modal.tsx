import { api } from "@/api/client";
import { UserSchema } from "@/api/generated";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

interface ReapplyModalProps {
  session: UserSchema;
}

export default function ReapplyModal({ session }: ReapplyModalProps) {
  const [showReapplyModal, setShowReapplyModal] = useState(false);
  const navigate = useNavigate();

  const { data } = useQuery({
    queryKey: ["getReapplicationStatus", session?.id],
    queryFn: () => {
      if (!session?.id) return null;
      return api.status.getReapplicationStatus({
        id: session.id,
      });
    },
    enabled: !!session?.id,
  });

  useEffect(() => {
    if (data && data.body.status) {
      setShowReapplyModal(true);
    }
  }, [data]);

  return (
    <Dialog open={showReapplyModal} onOpenChange={setShowReapplyModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold text-dark">
            Masa bantuan akan segera berakhir!
          </DialogTitle>
        </DialogHeader>

        <DialogDescription className="text-center">
          Masa bantuan orang tua asuh Anda akan berakhir dalam{" "}
          {data?.body.daysRemaining ?? 0} hari. Apakah Anda ingin memperpanjang
          periode bantuan ini?
        </DialogDescription>

        <DialogFooter className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button
            variant="outline"
            onClick={() => setShowReapplyModal(false)}
            className="w-full sm:w-auto"
          >
            Nanti saja
          </Button>
          <Button
            variant="default"
            onClick={() => {
              navigate({ to: "/profile" });
              setShowReapplyModal(false);
            }}
            className="bg-primary w-full sm:w-auto"
          >
            Perpanjang
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
