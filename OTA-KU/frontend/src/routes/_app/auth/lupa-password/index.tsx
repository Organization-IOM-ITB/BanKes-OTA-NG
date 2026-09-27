import { api } from "@/api/client";
import Metadata from "@/components/metadata";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ForgotPasswordSchema } from "@/lib/zod/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Link, createFileRoute, redirect } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/_app/auth/lupa-password/")({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    const user = context.session;

    if (user) {
      throw redirect({ to: "/" });
    }
  },
});

type ForgotPasswordFormValues = z.infer<typeof ForgotPasswordSchema>;

function RouteComponent() {
  const temporaryPasswordCallbackMutation = useMutation({
    mutationFn: (data: ForgotPasswordFormValues) =>
      api.auth.forgotPassword({ formData: data }),
    onSuccess: (data, _variables, context) => {
      toast.dismiss(context);
      toast.success("Kata sandi sementara berhasil dibuat", {
        description: data.message,
      });
    },
    onError: (error, _variables, context) => {
      toast.dismiss(context);
      toast.warning("Gagal membuat kata sandi sementara", {
        description: error.message,
      });
    },
    onMutate: () => {
      const loading = toast.loading("Sedang membuat kata sandi sementara...", {
        description: "Mohon tunggu sebentar",
        duration: Infinity,
      });
      return loading;
    },
  });

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(ForgotPasswordSchema),
  });

  function onSubmit(data: ForgotPasswordFormValues) {
    temporaryPasswordCallbackMutation.mutate(data);
  }

  return (
    <main className="text-primary flex min-h-[calc(100vh-70px)] flex-col items-center justify-center p-2 px-6 py-8 md:px-12 lg:min-h-[calc(100vh-96px)]">
      <Metadata title="Lupa Password | OTA-Ku" />
      <div className="w-full md:w-3/5 lg:w-1/2">
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <img src={`${import.meta.env.BASE_URL}logo-iom-icon.svg`} alt="IOM-ITB Logo" className="h-16" />
          </div>
          <h1 className="text-3xl font-bold md:text-4xl xl:text-5xl">
            Lupa Kata Sandi
          </h1>
          <p className="my-6 text-xl md:text-2xl xl:text-3xl">
            Masukkan Email Anda
          </p>
        </div>

        <div className="text-center text-sm md:text-base xl:text-lg">
          <div className="mb-6">
            <p className="">
              Kami akan mengirimkan kata sandi sementara ke email Anda
            </p>
            <p className="mt-2 text-amber-600">
              Password sementara hanya berlaku untuk satu kali login dan akan
              kedaluwarsa dalam 15 menit
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-center">
                    <FormControl>
                      <div className="relative w-full max-w-[300px]">
                        <Input
                          placeholder="Email"
                          autoCapitalize="none"
                          autoCorrect="off"
                          inputMode="email"
                          type="email"
                          className="pl-10 text-black"
                          {...field}
                        />
                        <Mail className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-500" />
                      </div>
                    </FormControl>
                    <FormMessage className="text-destructive mt-2 text-sm" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full max-w-[300px]"
                disabled={form.formState.isSubmitting}
              >
                Kirim Password Sementara
              </Button>
            </form>
          </Form>
        </div>

        <div className="flex flex-col pt-0 text-sm xl:text-base">
          <div className="mt-4 flex justify-center">
            <span>Ingat password Anda? </span>
            <Link
              to="/auth/login"
              className="ml-1 underline hover:cursor-pointer"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
