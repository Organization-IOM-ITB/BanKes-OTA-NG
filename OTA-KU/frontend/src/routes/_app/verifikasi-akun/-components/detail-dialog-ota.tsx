import { api, queryClient } from "@/api/client";
import { getApiErrorMessage } from "@/lib/api-error";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SessionContext } from "@/context/session";
import { formatValue } from "@/lib/formatter";
import { cn } from "@/lib/utils";
import { NotesVerificationRequestSchema } from "@/lib/zod/admin-verification";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CircleCheck, CircleX } from "lucide-react";
import { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { otaColumns } from "./constant";

type NotesVerificationFormValues = z.infer<
  typeof NotesVerificationRequestSchema
>;

function DetailDialogOta({
  id,
  status,
}: {
  id: string;
  status: "pending" | "accepted" | "rejected" | "reapply" | "outdated";
}) {
  const [open, setOpen] = useState(false);
  const session = useContext(SessionContext);

  const form = useForm<NotesVerificationFormValues>({
    resolver: zodResolver(NotesVerificationRequestSchema),
  });

  const changeStatusCallbackMutation = useMutation({
    mutationKey: ["changeStatusMahasiswa"],
    mutationFn: (data: NotesVerificationFormValues) => {
      return api.status.applicationStatus({
        formData: data,
        id: id,
      });
    },
    onSuccess: (_data, _variables, context) => {
      toast.dismiss(context);
      toast.success("Berhasil mengubah status", {
        description: "Status berhasil diubah",
      });
      queryClient.invalidateQueries({
        queryKey: ["listOrangTuaAdmin"],
        refetchType: "active",
      });
      setOpen(false);
    },
    onError: (error, _variables, context) => {
      toast.dismiss(context);
      toast.warning("Gagal mengubah status", {
        description: getApiErrorMessage(error, "Terjadi kesalahan"),
      });
    },
    onMutate: () => {
      const loading = toast.loading("Sedang mengubah status...", {
        description: "Mohon tunggu sebentar",
        duration: Infinity,
      });
      return loading;
    },
  });

  const { data, refetch } = useQuery({
    queryKey: ["detailOta", id],
    queryFn: () => api.detail.getOtaDetail({ id }),
    enabled: false,
  });

  async function onSubmit(data: NotesVerificationFormValues) {
    changeStatusCallbackMutation.mutate(data);
  }

  const isDisabled = session?.type !== "admin" && session?.type !== "bankes";

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
            Detail Info
          </DialogTitle>
          <DialogDescription className="flex text-start">
            <p
              className={cn(
                "rounded-full px-4 py-1 text-white",
                data?.body.applicationStatus === "accepted"
                  ? "bg-succeed"
                  : data?.body.applicationStatus === "pending"
                    ? "bg-[#EAB308]"
                    : data?.body.applicationStatus === "rejected"
                      ? "bg-destructive"
                      : data?.body.applicationStatus === "reapply"
                        ? "bg-blue-500"
                        : "bg-gray-500",
              )}
            >
              {data?.body.applicationStatus === "accepted"
                ? "Terverifikasi"
                : data?.body.applicationStatus === "pending"
                  ? "Tertunda"
                  : data?.body.applicationStatus === "rejected"
                    ? "Tertolak"
                    : data?.body.applicationStatus === "reapply"
                      ? "Pengajuan Ulang"
                      : data?.body.applicationStatus === "outdated"
                        ? "Kedaluarsa"
                        : "-"}
            </p>
          </DialogDescription>
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
                  data?.body[key as keyof typeof data.body] === ""
                    ? "-"
                    : (data?.body[key as keyof typeof data.body] ?? "-"),
                )}
              </p>
            </div>
          ))}

          <div
            className={cn(
              "mt-4 flex gap-4 self-center",
              status !== "pending" && status !== "reapply" && "hidden",
            )}
          >
            <div className="flex items-center gap-2">
              <p>Terima</p>
              <CircleCheck
                className={cn(
                  "text-succeed h-6 w-6",
                  !isDisabled && "hover:cursor-pointer",
                )}
                onClick={() => {
                  if (isDisabled || form.formState.isSubmitting) return;
                  form.setValue("status", "accepted");
                  form.setValue("notes", "-");
                  form.setValue("adminOnlyNotes", "-");
                  form.handleSubmit(onSubmit)();
                }}
              />
            </div>
            <div className="flex items-center gap-2">
              <CircleX
                className={cn(
                  "text-destructive h-6 w-6",
                  !isDisabled && "hover:cursor-pointer",
                )}
                onClick={async () => {
                  if (isDisabled || form.formState.isSubmitting) return;
                  form.setValue("status", "rejected");
                  form.setValue("notes", "-");
                  form.setValue("adminOnlyNotes", "-");
                  form.handleSubmit(onSubmit)();
                }}
              />
              <p>Tolak</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default DetailDialogOta;
