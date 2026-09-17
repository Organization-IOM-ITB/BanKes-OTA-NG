import { api } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SessionContext } from "@/context/session";
import { formatValue } from "@/lib/formatter";
import { otaColumns } from "@/routes/_app/verifikasi-akun/-components/constant";
import { useQuery } from "@tanstack/react-query";
import { useContext, useState } from "react";

function DetailDialogOta({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const session = useContext(SessionContext);

  const { data, refetch } = useQuery({
    queryKey: ["detailOta", id],
    queryFn: () => api.detail.getOtaDetail({ id }),
    enabled: open,
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          onClick={async () => {
            if (session) {
              await refetch();
              setOpen(true);
            }
          }}
        >
          Detail
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-8/12 flex-col sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-dark">
            Detail Orang Tua Asuh
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 flex-col overflow-y-scroll">
          {Object.entries(otaColumns).map(([key, value]) => (
            <div
              className="grid grid-cols-1 gap-2 border-b border-b-placeholder py-2 sm:grid-cols-2"
              key={key}
            >
              <p className="font-bold">{value}</p>
              <p className="line-clamp-1 text-dark sm:line-clamp-none">
                {formatValue(
                  key,
                  data?.body[key as keyof typeof data.body] ?? "-"
                )}
              </p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default DetailDialogOta;
