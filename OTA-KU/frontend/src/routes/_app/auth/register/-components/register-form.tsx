import { api, queryClient } from "@/api/client";
import { Button } from "@/components/ui/button";
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
import { redirectToKeycloakLogin } from "@/lib/keycloak";
import { UserRegisRequestSchema } from "@/lib/zod/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

type UserRegisterFormValues = z.infer<typeof UserRegisRequestSchema>;

interface RegisterFormProps {
  role: string;
  setRole: (role: string) => void;
  setIsClicked: (isClicked: boolean) => void;
}

export default function RegisterForm({
  role,
  setRole,
  setIsClicked,
}: RegisterFormProps) {
  const navigate = useNavigate();
  const registerCallbackMutation = useMutation({
    mutationFn: (data: UserRegisterFormValues) =>
      api.auth.regis({ formData: data }),
    onSuccess: (_data, _variables, context) => {
      toast.dismiss(context);
      toast.success("Berhasil melakukan registrasi", {
        description: "Silakan cek whatsapp Anda untuk verifikasi",
      });

      queryClient.invalidateQueries({ queryKey: ["verify"] });

      setTimeout(() => {
        navigate({ to: "/auth/otp-verification", reloadDocument: true });
      }, 1500); // 1.5 seconds delay
    },
    onError: (_error, _variables, context) => {
      toast.dismiss(context);
      toast.warning("Gagal melakukan registrasi", {
        description: "Silakan coba kembali atau periksa koneksi Anda",
      });
    },
    onMutate: () => {
      const loading = toast.loading("Sedang melakukan registrasi...", {
        description: "Mohon tunggu sebentar",
        duration: Infinity,
      });
      return loading;
    },
  });

  const form = useForm<UserRegisterFormValues>({
    resolver: zodResolver(UserRegisRequestSchema),
    defaultValues: {
      type: role as "mahasiswa" | "ota",
    },
  });

  async function onSubmit(values: UserRegisterFormValues) {
    registerCallbackMutation.mutate(values);
  }

  return (
    <section className="flex w-full flex-col items-center justify-center gap-9 py-8 md:px-12">
      <img
        src={`${import.meta.env.BASE_URL}icon/logo-basic.png`}
        alt="logo"
        className="mx-auto h-[81px] w-[123px]"
      />
      <h1 className="text-primary text-center text-3xl font-bold md:text-[50px]">
        Daftar Sebagai {role === "mahasiswa" ? "Mahasiswa" : "Orang Tua Asuh"}
      </h1>
      <h2 className="text-primary text-center text-2xl md:text-[26px]">
        Silahkan isi kolom yang tersedia
      </h2>
      <section className="w-full max-w-[400px]">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex w-full flex-col gap-5"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-primary text-sm">Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Masukkan email Anda"
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
                    <Input 
                      placeholder="Masukkan nomor WA Anda" 
                      inputMode="tel"
                      {...field} />
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
                      placeholder="Masukkan kata sandi Anda"
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
                      placeholder="Masukkan kata sandi Anda"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <Button
                type="button"
                variant={"outline"}
                onClick={() => {
                  setIsClicked(false);
                  setRole("");
                }}
                disabled={form.formState.isSubmitting}
              >
                Kembali
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                Buat Akun
              </Button>
            </div>

            {role === "mahasiswa" && (
              <>
                <p className="text-primary text-center">atau</p>
                <Button
                  type="button"
                  disabled={form.formState.isSubmitting}
                  variant={"outline"}
                  onClick={redirectToKeycloakLogin}
                >
                  Login dengan SSO IOM-ITB
                </Button>
              </>
            )}
          </form>
        </Form>
      </section>
    </section>
  );
}

