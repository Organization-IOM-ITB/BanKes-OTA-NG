import Metadata from "@/components/metadata";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link, createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";

import RegisterForm from "./-components/register-form";

export const Route = createFileRoute("/_app/auth/register/")({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    const user = context.session;

    if (user) {
      throw redirect({ to: "/" });
    }
  },
});

function RouteComponent() {
  const [role, setRole] = useState<string>("");
  const [isClicked, setIsClicked] = useState<boolean>(false);

  return (
    <main className="flex min-h-[calc(100vh-70px)] flex-col justify-center p-2 px-6 py-8 md:px-12 lg:min-h-[calc(100vh-96px)]">
      <Metadata title="Register | OTA-Ku" />
      <div
        className={cn(
          "flex flex-col items-center gap-9",
          isClicked && role && "hidden",
        )}
      >
        <img
          src={`${import.meta.env.BASE_URL}icon/logo-basic.png`}
          alt="logo"
          className="mx-auto h-[81px] w-[123px]"
        />
        <h1 className="text-primary text-center text-[32px] font-bold md:text-[50px]">
          Daftar
        </h1>
        <h2 className="text-primary text-center text-2xl md:text-[26px]">
          Mendaftar sebagai
        </h2>
        {/* Opsi Button */}
        <section className="inline-flex flex-col items-center gap-5">
          <div className="flex gap-5">
            <button
              className={cn(
                "hover:border-dark flex h-[110px] w-[114px] flex-col items-center justify-center gap-3 rounded-[4px] bg-white transition-all delay-[50ms] ease-linear hover:cursor-pointer hover:border-[3px] md:h-[151px] md:w-[156px]",
                role === "mahasiswa" && "border-dark border-[3px]",
              )}
              onClick={() => {
                setRole("mahasiswa");
                setIsClicked(false);
              }}
            >
              <img
                src={`${import.meta.env.BASE_URL}icon/icon-student.svg`}
                alt="icon-mahasiswa"
                className="h-[46px] w-[46px] md:h-16 md:w-16"
              />
              <span className="text-dark">Mahasiswa</span>
            </button>
            <button
              className={cn(
                "hover:border-dark flex h-[110px] w-[114px] flex-col items-center justify-center gap-3 rounded-[4px] bg-white transition-all delay-[50ms] ease-linear hover:cursor-pointer hover:border-[3px] md:h-[151px] md:w-[156px]",
                role === "ota" && "border-dark border-[3px]",
              )}
              onClick={() => {
                setRole("ota");
                setIsClicked(false);
              }}
            >
              <img
                src={`${import.meta.env.BASE_URL}icon/icon-parent.svg`}
                alt="icon-parent"
                className="h-[46px] w-[46px] md:h-16 md:w-16"
              />
              <span className="text-dark line-clamp-1">Orang Tua Asuh</span>
            </button>
          </div>
          <p className="text-primary text-center text-base">
            Pilih mendaftar sebagai mahasiswa atau orang tua asuh
          </p>
          <div className="flex w-full flex-col gap-2 text-center">
            <Button
              className="w-full"
              onClick={() => {
                setIsClicked(true);
              }}
            >
              Selanjutnya
            </Button>
            <p
              className={cn(
                "hidden",
                isClicked && "text-destructive block text-sm",
              )}
            >
              Pilih salah satu opsi di atas
            </p>
          </div>
        </section>
        <p className="text-primary text-center text-base">
          Sudah punya akun?{" "}
          <Link to="/auth/login">
            <span className="underline">Masuk sekarang!</span>{" "}
          </Link>
        </p>
      </div>

      {isClicked && role && (
        <RegisterForm
          role={role}
          setRole={setRole}
          setIsClicked={setIsClicked}
        />
      )}
    </main>
  );
}
