import { api } from "@/api/client";
import type { UserSchema } from "@/api/generated";
import Metadata from "@/components/metadata";
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
import { Textarea } from "@/components/ui/textarea";
import {
  getNimFakultasCodeMap,
  getNimFakultasFromNimJurusanMap,
  getNimJurusanCodeMap,
} from "@/lib/nim";
import { cn } from "@/lib/utils";
import { MahasiswaRegistrationFormSchema } from "@/lib/zod/profile";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { FileUp } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import Combobox from "./combobox";

export type MahasiswaRegistrationFormValues = z.infer<
  typeof MahasiswaRegistrationFormSchema
>;

type MahasiswaUploadField =
  | "file"
  | "kk"
  | "ktm"
  | "waliRecommendationLetter"
  | "transcript"
  | "salaryReport"
  | "pbb"
  | "electricityBill"
  | "ditmawaRecommendationLetter";

// type MahasiswaRegistrationField = keyof MahasiswaRegistrationFormValues;
const uploadFields: MahasiswaUploadField[] = [
  "file",
  "kk",
  "ktm",
  "waliRecommendationLetter",
  "transcript",
  "salaryReport",
  "pbb",
  "electricityBill",
  "ditmawaRecommendationLetter",
];

const documentDisplayNames: Record<MahasiswaUploadField, string> = {
  file: "Essay",
  kk: "Kartu Keluarga",
  ktm: "Kartu Tanda Mahasiswa",
  waliRecommendationLetter: "Surat Rekomendasi Wali",
  transcript: "Transkrip Nilai",
  salaryReport: "Surat Keterangan Gaji",
  pbb: "Pajak Bumi Bangunan",
  electricityBill: "Tagihan Listrik",
  ditmawaRecommendationLetter: "Surat Rekomendasi Ditmawa",
};

export default function PendaftaranMahasiswa({
  session,
  applicationStatus,
}: {
  session: UserSchema;
  applicationStatus: "rejected" | "pending" | "unregistered" | "outdated";
}) {
  const [fileNames, setFileNames] = useState<Record<string, string>>({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const [dragStates, setDragStates] = useState<Record<string, boolean>>({});
  const [fileURLs, setFileURLs] = useState<Record<string, string>>({});

  const navigate = useNavigate();
  const mahasiswaRegistrationCallbackMutation = useMutation({
    mutationFn: (data: MahasiswaRegistrationFormValues) =>
      api.profile.pendaftaranMahasiswa({ formData: data }),
    onSuccess: (_data, _variables, context) => {
      toast.dismiss(context);
      toast.success("Berhasil melakukan pendaftaran", {
        description: "Silakan tunggu hingga admin memverifikasi data",
      });

      localStorage.removeItem("pendaftaran-mahasiswa");

      setTimeout(() => {
        navigate({ to: "/profile", reloadDocument: true });
      }, 1000);
    },
    onError: (error, _variables, context) => {
      toast.dismiss(context);
      toast.warning("Gagal melakukan pendaftaran", {
        description: error.message,
      });
    },
    onMutate: () => {
      const loading = toast.loading("Sedang melakukan pendaftaran...", {
        description: "Mohon tunggu sebentar",
        duration: Infinity,
      });
      return loading;
    },
  });

  const nim = session.email.split("@")[0];
  const nimCode = nim.slice(0, 3);
  const jurusan = getNimJurusanCodeMap()[nimCode] || "TPB";
  const fakultas =
    getNimFakultasCodeMap()[getNimFakultasFromNimJurusanMap()[nimCode]] ||
    getNimFakultasCodeMap()[nimCode];

  const form = useForm<MahasiswaRegistrationFormValues>({
    resolver: zodResolver(MahasiswaRegistrationFormSchema),
    defaultValues: {
      name: applicationStatus !== "outdated" ? (session.name ?? "") : "",
      phoneNumber:
        applicationStatus !== "outdated" ? (session.phoneNumber ?? "") : "",
      nim,
      major: jurusan,
      faculty: fakultas,
      cityOfOrigin: "",
      highschoolAlumni: "",
      religion: "Islam",
      gender: "M",
      gpa: 0,
      description: "",
    },
  });

  useEffect(() => {
    const storedData = localStorage.getItem("pendaftaran-mahasiswa");
    if (storedData) {
      const decodedData = atob(storedData);
      const parsedData = JSON.parse(decodedData);
      form.setValue("name", parsedData.name || "");
      form.setValue("cityOfOrigin", parsedData.cityOfOrigin || "");
      form.setValue("highschoolAlumni", parsedData.highschoolAlumni || "");
      form.setValue("religion", parsedData.religion || "");
      form.setValue("gender", parsedData.gender || "");
      form.setValue("gpa", parsedData.gpa || "");
      form.setValue("description", parsedData.description || "");
    }
  }, [form]);

  // Save form data to local storage on interval of 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const formData = {
        name: form.getValues("name") || "",
        cityOfOrigin: form.getValues("cityOfOrigin") || "",
        highschoolAlumni: form.getValues("highschoolAlumni") || "",
        religion: form.getValues("religion") || "",
        gender: form.getValues("gender") || "",
        gpa: form.getValues("gpa") || "",
        description: form.getValues("description") || "",
      };
      localStorage.setItem(
        "pendaftaran-mahasiswa",
        btoa(JSON.stringify(formData)),
      );
    }, 5000);
    return () => clearInterval(interval);
  }, [form]);

  const handleFileChange = (
    field: keyof MahasiswaRegistrationFormValues,
    file: File | null,
  ) => {
    if (file) {
      setFileNames((prev) => ({
        ...prev,
        [field]: file.name,
      }));
      form.setValue(field, file);

      // Create object URL for the uploaded file
      const fileURL = URL.createObjectURL(file);
      setFileURLs((prev) => ({
        ...prev,
        [field]: fileURL,
      }));
    }
  };

  async function onSubmit(values: MahasiswaRegistrationFormValues) {
    if (Object.keys(form.formState.errors).length > 0) {
      return; // Prevent submission if there are errors
    }
    mahasiswaRegistrationCallbackMutation.mutate(values);
  }

  return (
    <main className="flex min-h-[calc(100vh-70px)] flex-col items-center justify-center gap-8 p-2 px-6 py-16 md:gap-12 md:px-12 lg:min-h-[calc(100vh-96px)] lg:gap-16">
      <Metadata title="Pendaftaran | OTA-Ku" />
      <img
        src={`${import.meta.env.BASE_URL}icon/logo-basic.png`}
        alt="logo"
        className="mx-auto h-[81px] w-[123px]"
      />

      <h1 className="text-primary text-center text-[32px] font-bold md:text-[50px]">
        Formulir Pendaftaran Calon Mahasiswa Asuh
      </h1>

      <section className="w-[100%] md:max-w-[960px]">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex w-full flex-col gap-5"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-primary text-sm after:text-red-500 after:content-['*']">
                    Nama Lengkap
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Masukkan nama Anda"
                      {...field}
                      disabled={
                        applicationStatus !== "outdated" && !!session.name
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel className="text-primary text-sm after:text-red-500 after:content-['*']">
                      Nomor HP (Whatsapp)
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Masukkan nomor WA Anda"
                        disabled={
                          applicationStatus !== "outdated" &&
                          !!session.phoneNumber
                        }
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="nim"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-primary text-sm after:text-red-500 after:content-['*']">
                    NIM
                  </FormLabel>
                  <FormControl>
                    <Input {...field} disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="major"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-primary text-sm after:text-red-500 after:content-['*']">
                    Jurusan
                  </FormLabel>
                  <FormControl>
                    <Input {...field} disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="faculty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-primary text-sm after:text-red-500 after:content-['*']">
                    Fakultas
                  </FormLabel>
                  <FormControl>
                    <Input {...field} disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cityOfOrigin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-primary text-sm after:text-red-500 after:content-['*']">
                    Kota Asal
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan kota asal Anda" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="highschoolAlumni"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-primary text-sm after:text-red-500 after:content-['*']">
                    Asal SMA
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan asal SMA Anda" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Combobox form={form} name="religion" />

            <Combobox form={form} name="gender" />

            <FormField
              control={form.control}
              name="gpa"
              render={({ field }) => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { onChange, ...rest } = field;

                return (
                  <FormItem>
                    <FormLabel className="text-primary text-sm after:text-red-500 after:content-['*']">
                      IPK
                    </FormLabel>
                    <p className="text-muted-foreground text-xs">
                      Gunakan tanda titik (.) untuk desimal
                    </p>
                    <FormControl>
                      <Input
                        placeholder="Masukkan IPK"
                        onChange={(e) => {
                          const value = e.target.value;
                          // Allow empty input, or a valid decimal with max 2 digits after decimal point
                          if (
                            value === "" ||
                            /^\d{0,1}(\.\d{0,2})?$/.test(value)
                          ) {
                            field.onChange(value);
                          }
                        }}
                        {...rest}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-primary text-sm after:text-red-500 after:content-['*']">
                    Alasan keperluan bantuan
                  </FormLabel>
                  <FormControl>
                    <Textarea placeholder="Alasan" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-x-16 gap-y-16 md:grid-cols-2">
              {uploadFields.map((name) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name}
                  render={() => {
                    const isDragging = dragStates[name];

                    const handleDragOver = (
                      e: React.DragEvent<HTMLDivElement>,
                    ) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDragStates((prev) => ({ ...prev, [name]: true }));
                    };

                    const handleDragLeave = (
                      e: React.DragEvent<HTMLDivElement>,
                    ) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDragStates((prev) => ({ ...prev, [name]: false }));
                    };

                    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDragStates((prev) => ({ ...prev, [name]: false }));
                      const file = e.dataTransfer.files?.[0] || null;
                      handleFileChange(name, file);
                    };

                    return (
                      <FormItem
                        className={cn(
                          name === "ditmawaRecommendationLetter" &&
                            "col-span-1 md:col-span-2",
                        )}
                      >
                        <FormLabel
                          className={cn(
                            "text-primary text-sm",
                            name !== "ditmawaRecommendationLetter" &&
                              "after:text-red-500 after:content-['*']",
                          )}
                        >
                          {documentDisplayNames[name]}{" "}
                          {name === "ditmawaRecommendationLetter" &&
                            "(Opsional)"}
                        </FormLabel>
                        <FormControl>
                          <div
                            className={`flex flex-col items-center justify-center rounded-md border-2 ${
                              isDragging
                                ? "border-primary bg-primary/5"
                                : "border-muted-foreground/25 hover:border-muted-foreground/50"
                            } border-dashed p-6 transition-all`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                          >
                            <Input
                              type="file"
                              accept=".pdf"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                handleFileChange(name, file);
                                // Reset the input value to allow re-selecting the same file
                                if (!file) {
                                  e.target.value = "";
                                }
                              }}
                              ref={(el) => {
                                fileInputRefs.current[name] = el;
                              }}
                            />
                            <div className="flex flex-col items-center gap-2 text-center">
                              <FileUp className="text-muted-foreground h-8 w-8" />
                              <p className="text-sm font-medium">
                                {isDragging
                                  ? "Geser berkas kesini untuk upload"
                                  : fileNames[name] ||
                                    `Klik untuk upload atau drag & drop`}
                              </p>
                              <div className="flex gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    fileInputRefs.current[name]?.click()
                                  }
                                >
                                  Pilih {documentDisplayNames[name]}
                                </Button>
                                {fileURLs[name] && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      window.open(fileURLs[name], "_blank")
                                    }
                                  >
                                    Lihat File
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              ))}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              Kirim
            </Button>
          </form>
        </Form>
      </section>
    </main>
  );
}
