import { api, queryClient } from "@/api/client";
import { getApiErrorMessage } from "@/lib/api-error";
import { TransactionListAdminData } from "@/api/generated";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SessionContext } from "@/context/session";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { Row } from "@tanstack/react-table";
import { Check, ChevronDown } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { toast } from "sonner";

interface ComboboxDialogProps {
  row: Row<TransactionListAdminData>;
}

const transferStatus = [
  {
    value: "unpaid",
    label: "Belum Ditransfer",
  },
  {
    value: "paid",
    label: "Ditransfer",
  },
];

function ComboboxDialog({ row }: ComboboxDialogProps) {
  const session = useContext(SessionContext);
  const [open, setOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [value, setValue] = useState(row.original.transferStatus);

  // Mutation for accepting transfer status
  const acceptTransferStatusMutation = useMutation({
    mutationFn: ({ id }: { id: string }) =>
      api.transaction.acceptTransferStatus({
        formData: { id: id },
      }),

    onSuccess: (_, _variables, context) => {
      toast.dismiss(context);
      toast.success("Status transfer diubah menjadi Ditransfer", {
        description: "Perubahan berhasil disimpan.",
      });
      queryClient.invalidateQueries({
        queryKey: ["listTransactionAdmin"],
      });
    },
    onError: (error, _variables, context) => {
      toast.dismiss(context);
      toast.warning("Gagal mengubah status transfer", {
        description: getApiErrorMessage(error, "Terjadi kesalahan"),
      });
    },
    onMutate: () => {
      const loading = toast.loading("Sedang memperbarui status transfer...", {
        description: "Mohon tunggu sebentar",
        duration: Infinity,
      });
      return loading;
    },
  });

  useEffect(() => {
    if (!isDialogOpen) {
      setValue(row.original.transferStatus);
    }
  }, [isDialogOpen, row.original.transferStatus]);

  const isDisabled = session?.type !== "admin" && session?.type !== "bankes";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-[200px] justify-between rounded-md",
            value === "paid"
              ? "border-green-300 bg-green-50 text-green-600"
              : "border-orange-300 bg-orange-50 text-orange-600",
            row.original.transferStatus === "paid" &&
              "cursor-not-allowed opacity-80",
          )}
          disabled={
            row.original.transferStatus === "paid" ||
            row.original.status !== "paid" ||
            isDisabled
          }
        >
          {value
            ? transferStatus.find((status) => status.value === value)?.label
            : "Belum Ditransfer"}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandList>
            <CommandGroup>
              {transferStatus.map((status) => (
                <CommandItem
                  key={status.value}
                  value={status.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue as "paid" | "unpaid");
                    setOpen(false);
                    if (currentValue === "paid") {
                      setIsDialogOpen(true);
                    }
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === status.value ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {status.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>

      {isDialogOpen && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="flex max-h-8/12 flex-col sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-dark">
                Konfirmasi Transfer
              </DialogTitle>
            </DialogHeader>

            <p className="text-sm text-gray-500">
              Apakah Anda yakin ingin mengubah status transfer ini? Tindakan ini
              akan memperbarui status transfer mahasiswa dan{" "}
              <b>tidak dapat dibatalkan</b>.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <Button
                type="submit"
                onClick={() => {
                  acceptTransferStatusMutation.mutate({
                    id: row.original.id,
                  });
                  setIsDialogOpen(false);
                }}
                disabled={acceptTransferStatusMutation.isPending}
              >
                Lanjutkan
              </Button>
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  setIsDialogOpen(false);
                }}
                disabled={acceptTransferStatusMutation.isPending}
              >
                Batal
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Popover>
  );
}

export default ComboboxDialog;
