import { api, queryClient } from "@/api/client";
import { TransactionListVerificationAdminData } from "@/api/generated";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SessionContext } from "@/context/session";
import { formatFunding } from "@/lib/formatter";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { Row } from "@tanstack/react-table";
import {
  AlertCircle,
  Calendar,
  Check,
  ChevronDown,
  DollarSign,
  FileText,
} from "lucide-react";
import { useContext, useState } from "react";
import { toast } from "sonner";

import { TransactionStatus } from "./collapsible-data-table";

const getStatusBadge = (status: TransactionStatus) => {
  const config = {
    paid: {
      variant: "default" as const,
      label: "Telah Dibayar",
      className: "bg-green-100 text-green-800",
    },
    pending: {
      variant: "secondary" as const,
      label: "Menunggu Verifikasi",
      className: "bg-yellow-100 text-yellow-800",
    },
    unpaid: {
      variant: "destructive" as const,
      label: "Belum Dibayar",
      className: "bg-red-100 text-red-800",
    },
  };

  const { variant, label, className } = config[status];
  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  );
};

const formatDate = (dateString: string) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const transactionStatus = [
  {
    value: "paid",
    label: "Diterima",
  },
  {
    value: "unpaid",
    label: "Belum Diterima",
  },
];

interface DaftarTagihanFormProps {
  row: Row<TransactionListVerificationAdminData>;
}

function DaftarTagihanForm({ row }: DaftarTagihanFormProps) {
  const session = useContext(SessionContext);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<"paid" | "unpaid" | null>(null);
  const [amountPaid, setAmountPaid] = useState<string>();
  const [rejectionNote, setRejectionNote] = useState<string>("");

  const verifyTransactionAccCallbackMutation = useMutation({
    mutationFn: ({ ids, otaId }: { ids: string; otaId: string }) =>
      api.transaction.verifyTransactionAcc({
        formData: { ids, otaId },
      }),
    onSuccess: (_data, _variables, context) => {
      toast.dismiss(context);
      toast.success("Berhasil memverifikasi pembayaran", {
        description: "Silakan cek kembali data transaksi",
      });

      queryClient.invalidateQueries({
        queryKey: ["listTransactionVerificationAdmin"],
      });
    },
    onError: (error, _variables, context) => {
      toast.dismiss(context);
      toast.warning("Gagal memverifikasi pembayaran", {
        description: error.message,
      });
    },
    onMutate: () => {
      const loading = toast.loading("Sedang memverifikasi pembayaran...", {
        description: "Mohon tunggu sebentar",
        duration: Infinity,
      });
      return loading;
    },
  });

  const verifyTransactionRejectCallbackMutation = useMutation({
    mutationFn: ({
      ids,
      otaId,
      amountPaid,
      rejectionNote,
    }: {
      ids: string;
      otaId: string;
      amountPaid: number;
      rejectionNote: string;
    }) =>
      api.transaction.verifyTransactionReject({
        formData: { ids, otaId, amountPaid, rejectionNote },
      }),
    onSuccess: (_data, _variables, context) => {
      toast.dismiss(context);
      toast.success("Berhasil memverifikasi pembayaran", {
        description: "Silakan cek kembali data transaksi",
      });

      queryClient.invalidateQueries({
        queryKey: ["listTransactionVerificationAdmin"],
      });
    },
    onError: (error, _variables, context) => {
      toast.dismiss(context);
      toast.warning("Gagal memverifikasi pembayaran", {
        description: error.message,
      });
    },
    onMutate: () => {
      const loading = toast.loading("Sedang memverifikasi pembayaran...", {
        description: "Mohon tunggu sebentar",
        duration: Infinity,
      });
      return loading;
    },
  });

  const pendingIds = row.original.transactions
    .filter((transaction) => transaction.transactionStatus === "pending")
    .map((transaction) => transaction.id);

  const isDisabled = session?.type !== "admin" && session?.type !== "bankes";

  return (
    <div className="bg-gray-50 px-6 py-4">
      <h4 className="mb-4 text-sm font-semibold tracking-wide text-placeholder">
        Detail Transaksi Mahasiswa
      </h4>
      <div className="space-y-3">
        {row.original.transactions.map((transaction) => (
          <div
            key={transaction.mahasiswa_id}
            className="space-y-3 rounded-lg border border-gray-200 bg-white p-4"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-dark font-medium">
                    {transaction.name_ma}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    NIM: {transaction.nim_ma}
                  </Badge>
                </div>
                <div className="text-sm text-placeholder">
                  ID: {transaction.mahasiswa_id}
                </div>
              </div>
              <div className="text-right">
                {getStatusBadge(transaction.transactionStatus)}
                <div className="text-dark mt-1 text-sm font-semibold">
                  {formatFunding(transaction.bill)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-placeholder" />
                <div>
                  <div className="text-dark font-medium">
                    Tenggat Pembayaran
                  </div>
                  <div className="text-placeholder">
                    {formatDate(transaction.dueDate)}
                  </div>
                </div>
              </div>

              {transaction.paidAt && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-placeholder" />
                  <div>
                    <div className="text-dark font-medium">
                      Tanggal Pembayaran
                    </div>
                    <div className="text-placeholder">
                      {formatDate(transaction.paidAt)}
                    </div>
                  </div>
                </div>
              )}

              {transaction.receipt && (
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-placeholder" />
                  <div>
                    <div className="text-dark font-medium">
                      Bukti Pembayaran
                    </div>
                    <a
                      href={transaction.receipt}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 underline hover:text-blue-800"
                    >
                      Lihat Bukti Pembayaran
                    </a>
                  </div>
                </div>
              )}
            </div>

            {transaction.rejectionNote &&
              transaction.transactionStatus !== "paid" && (
                <div className="flex items-start gap-2 rounded border border-red-200 bg-red-50 p-3">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600" />
                  <div>
                    <div className="text-sm font-medium text-red-800">
                      Alasan Penolakan
                    </div>
                    <div className="text-sm text-red-700">
                      {transaction.rejectionNote}
                    </div>
                  </div>
                </div>
              )}
          </div>
        ))}

        {/* Check if some transactions is not paid */}
        {row.original.transactions.some(
          (transaction) => transaction.transactionStatus === "pending",
        ) && (
          <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-4">
            <div>
              <p className="text-dark text-md font-medium">
                Verifikasi Pembayaran
              </p>
            </div>

            <div className="flex items-end gap-4">
              <div className="flex flex-col gap-1">
                <Label className="text-dark text-sm font-medium">Status</Label>
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
                          : value === "unpaid"
                            ? "border-red-300 bg-red-50 text-red-600"
                            : "",
                      )}
                      disabled={isDisabled}
                    >
                      {value
                        ? transactionStatus.find(
                            (status) => status.value === value,
                          )?.label
                        : "Pilih Status"}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0">
                    <Command>
                      <CommandList>
                        <CommandGroup>
                          {transactionStatus.map((status) => (
                            <CommandItem
                              key={status.value}
                              value={status.value}
                              onSelect={(currentValue) => {
                                setValue(currentValue as "paid" | "unpaid");
                                setOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  value === status.value
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              {status.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {value === "unpaid" && (
                <div className="flex gap-2">
                  <div className="flex flex-col gap-1">
                    <Label className="text-dark text-sm font-medium">
                      Jumlah Pembayaran
                    </Label>
                    <Input
                      placeholder="Masukkan Jumlah Pembayaran"
                      value={amountPaid}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "" || /^([1-9]\d*|0)?$/.test(value)) {
                          setAmountPaid(value);
                        }
                      }}
                      disabled={isDisabled}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <Label className="text-dark text-sm font-medium">
                      Catatan Penolakan
                    </Label>
                    <Input
                      placeholder="Masukkan Catatan Penolakan"
                      value={rejectionNote}
                      onChange={(e) => setRejectionNote(e.target.value)}
                      disabled={isDisabled}
                    />
                  </div>
                </div>
              )}

              <Button
                variant="outline"
                className="rounded-md"
                disabled={
                  value === null ||
                  isDisabled ||
                  verifyTransactionAccCallbackMutation.isPending ||
                  verifyTransactionRejectCallbackMutation.isPending
                }
                onClick={() => {
                  return value === "paid"
                    ? verifyTransactionAccCallbackMutation.mutate({
                        ids: JSON.stringify(pendingIds),
                        otaId: row.original.ota_id,
                      })
                    : verifyTransactionRejectCallbackMutation.mutate({
                        ids: JSON.stringify(pendingIds),
                        otaId: row.original.ota_id,
                        amountPaid: Number(amountPaid),
                        rejectionNote: rejectionNote,
                      });
                }}
              >
                Verifikasi
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DaftarTagihanForm;
