import { api } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SessionContext } from "@/context/session";
import { formatValue } from "@/lib/formatter";
import { linkColumns, mahasiswaColumns } from "@/routes/_app/verifikasi-akun/-components/constant";
import { useQuery } from "@tanstack/react-query";
import { useContext, useState } from "react";

function DetailDialogMahasiswa({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const session = useContext(SessionContext);

  const { data, refetch } = useQuery({
    queryKey: ["detailMahasiswa", id],
    queryFn: () => api.detail.getMahasiswaDetail({ id }),
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
      <DialogContent className="flex max-h-8/12 flex-col sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-dark">
            Detail Mahasiswa
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 flex-col overflow-y-scroll">
          {Object.entries(mahasiswaColumns).map(([key, value]) => (
            <div
              className="grid grid-cols-1 gap-2 border-b border-b-placeholder py-2 sm:grid-cols-2"
              key={key}
            >
              <p className="font-bold">{value}</p>
              {linkColumns.includes(key) ? (
                <Button
                  asChild
                  className="place-self-start"
                  variant={"outline"}
                >
                  <a
                    href={
                      data?.body[key as keyof typeof data.body] !== undefined
                        ? String(data.body[key as keyof typeof data.body])
                        : "#"
                    }
                    rel="noreferrer"
                    target="_blank"
                  >
                    Unduh
                  </a>
                </Button>
              ) : (
                <p className="line-clamp-1 text-dark sm:line-clamp-none">
                  {formatValue(
                    key,
                    data?.body[key as keyof typeof data.body] ?? "-"
                  )}
                </p>
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default DetailDialogMahasiswa;
