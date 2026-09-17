import { api, queryClient } from "@/api/client";
import { getApiErrorMessage } from "@/lib/api-error";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CreateBankesPengurusSchema } from "@/lib/zod/profile";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Check, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const roles = [
  {
    value: "bankes",
    label: "Bantuan Kesejahteraan",
  },
  {
    value: "pengurus",
    label: "Pengurus",
  },
] as const;

type CreateBankesPengurusFormValues = z.infer<
  typeof CreateBankesPengurusSchema
>;

function CreateAccountDialog() {
  const [open, setOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const navigate = useNavigate();

  const form = useForm<CreateBankesPengurusFormValues>({
    resolver: zodResolver(CreateBankesPengurusSchema),
  });

  const pembuatanAkunBankesPengurusCallbackMutation = useMutation({
    mutationKey: ["pembuatanAkunBankesPengurus"],
    mutationFn: (formData: CreateBankesPengurusFormValues) =>
      api.profile.pembuatanAkunBankesPengurus({ formData }),
    onSuccess: (_data, _variables, context) => {
      toast.dismiss(context);
      toast.success("Berhasil membuat akun", {
        description: "Akun berhasil dibuat",
      });
      form.reset();
      queryClient.invalidateQueries({
        queryKey: ["listAllAccount"],
        exact: false,
      });
      setOpen(false);
      navigate({
        to: "/manajemen-akun",
        search: {
          page: 1,
        },
      });
    },
    onError: (error, _variables, context) => {
      toast.dismiss(context);
      toast.warning("Gagal membuat akun", {
        description: getApiErrorMessage(error, "Terjadi kesalahan"),
      });
    },
    onMutate: () => {
      const loading = toast.loading("Sedang membuat akun...", {
        description: "Mohon tunggu sebentar",
        duration: Infinity,
      });
      return loading;
    },
  });

  function onSubmit(data: CreateBankesPengurusFormValues) {
    pembuatanAkunBankesPengurusCallbackMutation.mutate(data);
  }

  const value = form.watch("type");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="sm:px-8">Buat Akun</Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-8/12 flex-col sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-dark">
            Buat Akun
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex w-full flex-col gap-5 overflow-y-scroll"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-primary text-sm">Nama</FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan nama" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-primary text-sm">Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Masukkan email"
                      autoCapitalize="none"
                      autoCorrect="off"
                      inputMode="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-primary text-sm">
                    Nomor HP (Whatsapp)
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan nomor WA" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-primary text-sm">
                    Kata sandi
                  </FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder="Masukkan kata sandi"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-primary text-sm">
                    Konfirmasi kata sandi
                  </FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder="Masukkan kata sandi"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-primary text-sm">
                    Tipe akun
                  </FormLabel>
                  <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={open}
                          className={cn(
                            "hover:bg-accent focus-visible:ring-ring data-[state=open]:bg-accent data-[state=open]:text-accent-foreground hover:text-accent-foreground justify-between rounded-md border border-placeholder bg-white text-placeholder shadow-xs focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                            value ? "text-accent-foreground" : "text-placeholder",
                          )}
                        >
                          {value
                            ? roles.find((role) => role.value === value)?.label
                            : "Pilih tipe akun"}
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                      <Command>
                        <CommandList>
                          <CommandGroup>
                            {roles.map((role) => (
                              <CommandItem
                                value={role.value}
                                key={role.value}
                                onSelect={(currentValue) => {
                                  if (currentValue === value) {
                                    form.resetField("type");
                                  } else {
                                    form.setValue("type", role.value);
                                  }
                                  setPopoverOpen(false);
                                }}
                              >
                                {role.label}
                                <Check
                                  className={cn(
                                    "ml-auto",
                                    role.value === field.value
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <Button
                type="submit"
                disabled={pembuatanAkunBankesPengurusCallbackMutation.isPending}
              >
                Buat Akun
              </Button>
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  setOpen(false);
                }}
                disabled={pembuatanAkunBankesPengurusCallbackMutation.isPending}
              >
                Batal
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default CreateAccountDialog;
