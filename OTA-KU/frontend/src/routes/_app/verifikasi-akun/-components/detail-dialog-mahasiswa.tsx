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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SessionContext } from "@/context/session";
import { formatValue } from "@/lib/formatter";
import { cn } from "@/lib/utils";
import { NotesVerificationRequestSchema } from "@/lib/zod/admin-verification";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CircleCheck, CircleX } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { inputColumns, linkColumns, mahasiswaColumns } from "./constant";

type NotesVerificationFormValues = z.infer<
  typeof NotesVerificationRequestSchema
>;

function DetailDialogMahasiswa({
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
        queryKey: ["listMahasiswaAdmin"],
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
    queryKey: ["detailMahasiswa", id],
    queryFn: () => api.detail.getMahasiswaDetail({ id }),
    enabled: false,
  });

  async function onSubmit(data: NotesVerificationFormValues) {
    changeStatusCallbackMutation.mutate(data);
  }

  useEffect(() => {
    if (data) {
      form.reset({
        bill: data.body.bill ?? 0,
        notes: data.body.notes ?? "",
        adminOnlyNotes: data.body.adminOnlyNotes ?? "",
      });
    }
  }, [data, form]);

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
      <DialogContent className="flex max-h-8/12 flex-col sm:max-w-2xl">
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

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-1 flex-col overflow-y-scroll"
          >
            {Object.entries(mahasiswaColumns).map(([key, value]) => (
              <div
                className="grid grid-cols-1 gap-2 border-b border-b-placeholder py-2 sm:grid-cols-2"
                key={key}
              >
                <p className="font-bold">{value}</p>
                <>
                  {linkColumns.includes(key) ? (
                    <Button
                      asChild
                      className="place-self-start"
                      variant={"outline"}
                    >
                      <a
                        href={String(
                          data?.body[key as keyof typeof data.body] ?? "#",
                        )}
                        rel="noreferrer"
                        target="_blank"
                      >
                        Unduh
                      </a>
                    </Button>
                  ) : inputColumns.includes(key) ? (
                    <FormField
                      control={form.control}
                      name={key as keyof NotesVerificationFormValues}
                      defaultValue={
                        status !== "pending" && status !== "reapply" ? "-" : ""
                      }
                      render={({ field }) => {
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        const { onChange, ...rest } = field;

                        return (
                          <FormItem className="mr-4">
                            <FormControl>
                              {key === "bill" ? (
                                <Input
                                  disabled={
                                    (status !== "pending" &&
                                      status !== "reapply") ||
                                    isDisabled
                                  }
                                  placeholder="Masukkan dana kebutuhan"
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    if (
                                      value === "" ||
                                      /^([1-9]\d*|0)?$/.test(value)
                                    ) {
                                      field.onChange(value);
                                    }
                                  }}
                                  {...rest}
                                />
                              ) : (
                                <Textarea
                                  disabled={
                                    (status !== "pending" &&
                                      status !== "reapply") ||
                                    isDisabled
                                  }
                                  placeholder="Masukkan catatan"
                                  {...field}
                                />
                              )}
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                  ) : (
                    <p className="line-clamp-1 text-dark sm:line-clamp-none">
                      {formatValue(
                        key,
                        data?.body[key as keyof typeof data.body] ?? "-",
                      )}
                    </p>
                  )}
                </>
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
                    form.handleSubmit(onSubmit)();
                  }}
                />
                <p>Tolak</p>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default DetailDialogMahasiswa;
