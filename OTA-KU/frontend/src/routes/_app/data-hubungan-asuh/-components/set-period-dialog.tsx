import { api, queryClient } from "@/api/client";
import { getApiErrorMessage } from "@/lib/api-error";
import type { ConnectionListAllResponse } from "@/api/generated";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SessionContext } from "@/context/session";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { CalendarDays } from "lucide-react";
import { useContext, useState } from "react";
import { toast } from "sonner";

function SetPeriodDialog({
  connection,
}: {
  connection: ConnectionListAllResponse;
}) {
  const session = useContext(SessionContext);
  const [open, setOpen] = useState(false);

  const defaultStart = connection.start_date
    ? connection.start_date.slice(0, 10)
    : new Date().toISOString().slice(0, 10);
  const defaultEnd = connection.end_date
    ? connection.end_date.slice(0, 10)
    : new Date(Date.now() + 183 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);

  const setPeriodMutation = useMutation({
    mutationKey: ["setConnectionPeriod", connection.mahasiswa_id, connection.ota_id],
    mutationFn: () =>
      api.connect.setConnectionPeriod({
        formData: {
          mahasiswaId: connection.mahasiswa_id,
          otaId: connection.ota_id,
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
        },
      }),
    onSuccess: (_data, _variables, context) => {
      toast.dismiss(context);
      toast.success("Periode hubungan asuh berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: ["listAllConnection"], exact: false });
      setOpen(false);
    },
    onError: (error, _variables, context) => {
      toast.dismiss(context);
      toast.warning("Gagal memperbarui periode", { description: getApiErrorMessage(error, "Terjadi kesalahan") });
    },
    onMutate: () =>
      toast.loading("Menyimpan periode...", { duration: Infinity }),
  });

  const isDisabled =
    session?.type !== "admin" &&
    session?.type !== "bankes" &&
    session?.type !== "pengurus";

  const handleSubmit = () => {
    if (!startDate || !endDate) {
      toast.error("Tanggal mulai dan tanggal akhir wajib diisi");
      return;
    }
    if (new Date(endDate) <= new Date(startDate)) {
      toast.error("Tanggal akhir harus setelah tanggal mulai");
      return;
    }
    setPeriodMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger disabled={isDisabled} asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-7 gap-1 text-xs",
            isDisabled && "cursor-not-allowed opacity-50",
          )}
        >
          <CalendarDays className="h-3.5 w-3.5" />
          Atur Periode
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-dark">
            Atur Periode Hubungan Asuh
          </DialogTitle>
          <p className="text-muted-foreground text-sm">
            <span className="font-medium">{connection.name_ma}</span> &amp;{" "}
            <span className="font-medium">{connection.name_ota}</span>
          </p>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="start-date">Tanggal Mulai</Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={setPeriodMutation.isPending}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="end-date">Tanggal Akhir</Label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
              disabled={setPeriodMutation.isPending}
            />
          </div>
          <p className="text-muted-foreground text-xs">
            Periode default 1 semester (±6 bulan). Sistem akan otomatis mengubah
            status menjadi <span className="font-medium">Berakhir</span> saat
            tanggal akhir tercapai.
          </p>
        </div>

        <DialogFooter className="flex flex-row gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setOpen(false)}
            disabled={setPeriodMutation.isPending}
          >
            Batal
          </Button>
          <Button
            className="flex-1"
            onClick={handleSubmit}
            disabled={setPeriodMutation.isPending}
          >
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default SetPeriodDialog;
