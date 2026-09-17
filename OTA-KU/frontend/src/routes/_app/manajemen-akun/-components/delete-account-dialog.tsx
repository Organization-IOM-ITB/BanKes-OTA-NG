import { api, queryClient } from "@/api/client";
import { getApiErrorMessage } from "@/lib/api-error";
import { AllAccountListElement } from "@/api/generated";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

function DeleteAccountDialog({
  account,
  setOpen,
}: {
  account: AllAccountListElement;
  setOpen: (open: boolean) => void;
}) {
  const navigate = useNavigate();

  const deleteAccountCallbackMutation = useMutation({
    mutationKey: ["deleteAccount", account.id],
    mutationFn: () => api.profile.deleteAccount({ id: account.id }),
    onSuccess: (_data, _variables, context) => {
      toast.dismiss(context);
      toast.success("Berhasil menghapus akun", {
        description: "Akun berhasil dihapus",
      });
      queryClient.invalidateQueries({
        queryKey: ["listAllAccount"],
        exact: false,
      });
      navigate({
        to: "/manajemen-akun",
        search: {
          page: 1,
        },
      });
    },
    onError: (error, _variables, context) => {
      toast.dismiss(context);
      toast.warning("Gagal menghapus akun", {
        description: getApiErrorMessage(error, "Terjadi kesalahan"),
      });
    },
    onMutate: () => {
      const loading = toast.loading("Sedang menghapus akun...", {
        description: "Mohon tunggu sebentar",
        duration: Infinity,
      });
      return loading;
    },
  });

  return (
    <DialogContent className="flex max-h-8/12 flex-col sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold text-dark">
          Hapus Akun
        </DialogTitle>
      </DialogHeader>

      <p className="text-sm text-gray-500">
        Apakah Anda yakin ingin menghapus akun ini? Semua data yang terkait
        dengan akun ini akan dihapus secara <b>permanen</b> dan tidak dapat
        dipulihkan.
      </p>

      <DialogFooter className="flex flex-row space-x-2">
        <Button
          variant="outline"
          type="button"
          onClick={() => {
            setOpen(false);
          }}
          className="flex-1"
          disabled={deleteAccountCallbackMutation.isPending}
        >
          Batal
        </Button>
        <Button
          type="submit"
          onClick={() => {
            deleteAccountCallbackMutation.mutate();
            setOpen(false);
          }}
          className="flex-1"
          disabled={deleteAccountCallbackMutation.isPending}
        >
          Lanjutkan
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

export default DeleteAccountDialog;
