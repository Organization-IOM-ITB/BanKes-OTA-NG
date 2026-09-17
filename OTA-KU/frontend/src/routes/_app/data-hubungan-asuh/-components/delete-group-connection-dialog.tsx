import { queryClient } from "@/api/client";
import { groupService } from "@/api/groupService";
import { getApiErrorMessage } from "@/lib/api-error";
import type { PendingConnection } from "@/types/group";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SessionContext } from "@/context/session";
import { cn } from "@/lib/utils";
import { DialogDescription } from "@radix-ui/react-dialog";
import { useMutation } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { useContext, useState } from "react";
import { toast } from "sonner";

function DeleteGroupConnectionDialog({
  connection,
}: {
  connection: PendingConnection;
}) {
  const session = useContext(SessionContext);
  const [open, setOpen] = useState(false);

  const deleteConnectionMutation = useMutation({
    mutationKey: ["deleteGroupConnection"],
    mutationFn: () => groupService.deleteGroupConnection(connection.id),
    onSuccess: (_data, _variables, context) => {
      toast.dismiss(context);
      toast.success("Berhasil memutus hubungan grup", {
        description: "Hubungan grup dengan mahasiswa berhasil diputus. Grup tetap ada.",
      });
      queryClient.invalidateQueries({
        queryKey: ["listAllGroupConnection"],
        exact: false,
      });
      setOpen(false);
    },
    onError: (error, _variables, context) => {
      toast.dismiss(context);
      toast.warning("Gagal memutus hubungan grup", {
        description: getApiErrorMessage(error, "Terjadi kesalahan"),
      });
    },
    onMutate: () => {
      const loading = toast.loading("Sedang memutus hubungan grup...", {
        description: "Mohon tunggu sebentar",
        duration: Infinity,
      });
      return loading;
    },
  });

  const isDisabled = session?.type !== "admin" && session?.type !== "bankes";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger disabled={isDisabled}>
        <Trash2
          className={cn(
            "text-destructive h-5 w-5",
            !isDisabled && "hover:cursor-pointer",
          )}
        />
      </DialogTrigger>
      <DialogContent className="flex max-h-8/12 flex-col sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-dark">
            Apakah Anda yakin?
          </DialogTitle>
          <DialogDescription>
            Anda akan memutus hubungan grup <b>{connection.groupName}</b> dengan
            mahasiswa <b>{connection.mahasiswaName}</b>. Aksi ini tidak dapat
            diubah setelah dilakukan. Grup OTA tidak akan dihapus, hanya
            hubungannya dengan mahasiswa ini yang akan diputus. Notifikasi terkait
            pemberhentian hubungan akan dikirimkan kepada semua anggota grup dan
            mahasiswa melalui email. Apakah Anda yakin ingin melanjutkan?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex flex-row space-x-2">
          <Button
            variant="outline"
            type="button"
            onClick={() => {
              setOpen(false);
            }}
            className="flex-1"
            disabled={deleteConnectionMutation.isPending}
          >
            Batal
          </Button>
          <Button
            type="submit"
            onClick={() => {
              deleteConnectionMutation.mutate();
            }}
            className="flex-1"
            disabled={deleteConnectionMutation.isPending}
          >
            Lanjutkan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DeleteGroupConnectionDialog;
