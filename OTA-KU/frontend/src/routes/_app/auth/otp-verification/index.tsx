import { api, queryClient } from "@/api/client";
import { SendOtpRequestSchema } from "@/api/generated";
import Metadata from "@/components/metadata";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { OTPVerificationRequestSchema } from "@/lib/zod/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { CountdownTimer } from "./-components/countdown-timer";

export const Route = createFileRoute("/_app/auth/otp-verification/")({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    const user = context.session;

    if (!user) {
      throw redirect({ to: "/auth/login" });
    }

    const status = await api.status
      .getVerificationStatus({ id: user.id })
      .catch(() => null);

    if (!status) {
      throw redirect({ to: "/auth/login" });
    }

    if (status.body.status === "verified") {
      throw redirect({ to: "/pendaftaran" });
    }

    return { session: user };
  },
  loader: async ({ context }) => {
    return { session: context.session };
  },
});

type OTPVerificationFormValues = z.infer<typeof OTPVerificationRequestSchema>;

function RouteComponent() {
  const { session } = Route.useLoaderData();
  const navigate = useNavigate();
  // Diisi register-form.tsx via sessionStorage saat submit registrasi.
  // Default ke "email" (channel default verifikasi) kalau tidak ada -
  // mis. user reload halaman ini langsung tanpa lewat alur registrasi.
  const otpChannel: "email" | "whatsapp" =
    (typeof window !== "undefined" &&
      (sessionStorage.getItem("otpChannel") as "email" | "whatsapp" | null)) ||
    "email";
  const otpCallbackMutation = useMutation({
    mutationFn: (data: OTPVerificationFormValues) =>
      api.auth.otp({ formData: data }),
    onSuccess: (_data, _variables, context) => {
      toast.dismiss(context);
      toast.success("Berhasil melakukan verifikasi", {
        description: "Selamat datang kembali!",
      });

      queryClient.invalidateQueries({ queryKey: ["verify"] });

      setTimeout(() => {
        navigate({ to: "/pendaftaran", reloadDocument: true });
      }, 1500); // 1.5 seconds delay
    },
    onError: (error, _variables, context) => {
      toast.dismiss(context);
      toast.warning("Gagal melakukan verifikasi", {
        description: error.message,
      });
    },
    onMutate: () => {
      const loading = toast.loading("Sedang melakukan verifikasi...", {
        description: "Mohon tunggu sebentar",
        duration: Infinity,
      });
      return loading;
    },
  });

  const otpResendCallbackMutation = useMutation({
    mutationFn: (formData: SendOtpRequestSchema) =>
      api.otp.sendOtp({ formData: formData }),
    onSuccess: (_data, _variables, context) => {
      toast.dismiss(context);
      toast.success("Berhasil mengirim ulang OTP", {
        description:
          otpChannel === "whatsapp" ? "Silakan cek WhatsApp Anda" : "Silakan cek email Anda",
      });
    },
    onError: (error, _variables, context) => {
      toast.dismiss(context);
      toast.warning("Gagal mengirim ulang OTP", {
        description: error.message,
      });
    },
    onMutate: () => {
      const loading = toast.loading("Mengirim ulang OTP...", {
        description: "Mohon tunggu sebentar",
        duration: Infinity,
      });
      return loading;
    },
  });

  const { data: otpExpiredData } = useQuery({
    queryKey: ["otp-expired"],
    queryFn: () => api.otp.getOtpExpiredDate().catch(() => null),
  });

  const form = useForm<OTPVerificationFormValues>({
    resolver: zodResolver(OTPVerificationRequestSchema),
  });

  function onSubmit(data: OTPVerificationFormValues) {
    otpCallbackMutation.mutate(data);
  }

  const handleResend = () => {
    if (!session?.email) {
      toast.warning("Email tidak ditemukan", {
        description: "Silakan coba lagi",
      });
      return;
    }

    const formData = { email: session?.email, otpChannel };
    otpResendCallbackMutation.mutate(formData);
  };

  return (
    <main className="text-primary flex min-h-[calc(100vh-70px)] flex-col items-center justify-center p-2 px-6 py-8 md:px-12 lg:min-h-[calc(100vh-96px)]">
      <Metadata title="Verifikasi OTP | BOTA" />
      <div className="w-full md:w-3/5 lg:w-1/2">
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <img src={`${import.meta.env.BASE_URL}logo-iom-icon.svg`} alt="IOM-ITB Logo" className="h-16" />
          </div>
          <h1 className="text-3xl font-bold md:text-4xl xl:text-5xl">
            Verifikasi Kode OTP
          </h1>
          <p className="my-6 text-xl md:text-2xl xl:text-3xl">
            {otpChannel === "whatsapp" ? "Cek WhatsApp Anda" : "Cek Email Anda"}
          </p>
        </div>

        <div className="text-center text-sm md:text-base xl:text-lg">
          <div className="mb-6">
            <p className="">
              {otpChannel === "whatsapp"
                ? "Kami telah mengirimkan kode 6 digit ke WhatsApp Anda:"
                : "Kami telah mengirimkan kode 6 digit ke email Anda:"}
            </p>
            <p className="mt-1 font-medium">
              {otpChannel === "whatsapp" ? session?.phoneNumber : session?.email}
            </p>
            <p className="mt-1">
              Silahkan masukkan kode tersebut untuk melanjutkan
            </p>
            <p>
              <CountdownTimer expiresAt={otpExpiredData?.expiredAt || ""} />
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="pin"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-center">
                    <FormControl>
                      <InputOTP
                        maxLength={6}
                        {...field}
                        pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                        inputMode="text"
                        autoCapitalize="on"
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
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
                Lanjutkan
              </Button>
            </form>
          </Form>
        </div>

        <div className="flex flex-col pt-0 text-sm xl:text-base">
          <div className="mt-4 flex justify-center">
            <span>Belum menerima kode? </span>
            <button
              onClick={handleResend}
              disabled={otpResendCallbackMutation.isPending}
              className="ml-1 underline hover:cursor-pointer"
            >
              Kirim ulang
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
