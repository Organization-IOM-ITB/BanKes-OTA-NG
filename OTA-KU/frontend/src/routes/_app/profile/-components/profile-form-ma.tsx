import { api, queryClient } from "@/api/client";
import { getApiErrorMessage } from "@/lib/api-error";
import { UserSchema } from "@/api/generated";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Fakultas,
  Jurusan,
  getNimFakultasCodeMap,
  getNimFakultasFromNimJurusanMap,
  getNimJurusanCodeMap,
} from "@/lib/nim";
import { cn } from "@/lib/utils";
import { MahasiswaProfileFormSchema } from "@/lib/zod/profile";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { FileUp } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

type MahasiswaProfileFormValues = z.infer<typeof MahasiswaProfileFormSchema>;

type MahasiswaProfileField = keyof MahasiswaProfileFormValues;

const uploadFields: MahasiswaProfileField[] = [
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

const uploadFieldLabels: Record<MahasiswaProfileField, string> = {
  file: "Essay",
  kk: "Kartu Keluarga",
  ktm: "Kartu Tanda Mahasiswa",
  waliRecommendationLetter: "Surat Rekomendasi Wali",
  transcript: "Transkrip Nilai",
  salaryReport: "Laporan Gaji",
  pbb: "PBB",
  electricityBill: "Tagihan Listrik",
  ditmawaRecommendationLetter: "Surat Rekomendasi Ditmawa",
  phoneNumber: "Nomor HP",
  name: "Nama Lengkap",
  nim: "NIM",
  major: "Jurusan",
  faculty: "Fakultas",
  cityOfOrigin: "Kota Asal",
  highschoolAlumni: "Asal SMA",
  description: "Alasan Keperluan Bantuan",
  gender: "Jenis Kelamin",
  gpa: "IPK",
  religion: "Agama",
};

// Religion options from enum
const religionOptions = [
  "Islam",
  "Kristen Protestan",
  "Katolik",
  "Hindu",
  "Buddha",
  "Konghucu",
];

// Gender options from enum
const genderOptions = [
  { value: "M", label: "Laki-Laki" },
  { value: "F", label: "Perempuan" },
];

interface ProfileFormProps {
  session: UserSchema;
  isEditable?: boolean;
  setIsEditingEnabled: (isEditing: boolean) => void;
}

const ProfileFormMA: React.FC<ProfileFormProps> = ({
  session,
  setIsEditingEnabled,
  isEditable = false,
}) => {
  const [fileNames, setFileNames] = useState<Record<string, string>>({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [previouslyUploadedFiles, setPreviouslyUploadedFiles] = useState<
    Record<string, string>
  >({});

  // Create form with zod validation
  const form = useForm<MahasiswaProfileFormValues>({
    resolver: zodResolver(MahasiswaProfileFormSchema),
    defaultValues: {
      phoneNumber: session?.phoneNumber ?? "",
      gpa: 0,
    },
  });

  // Fetch existing profile data
  const { data: profileData } = useQuery({
    queryKey: ["mahasiswaProfile", session?.id],
    queryFn: () => api.profile.profileMahasiswa({ id: session?.id ?? "" }),
    enabled: !!session?.id,
  });

  // Set form values once profile data is loaded
  useEffect(() => {
    if (profileData?.body) {
      // Set data dasar profil
      form.setValue("phoneNumber", profileData.body.phone_number || "");
      form.setValue("name", profileData.body.name || "");

      // Set data detail mahasiswa jika tersedia
      if (profileData.body.nim) form.setValue("nim", profileData.body.nim);
      if (profileData.body.major)
        form.setValue("major", profileData.body.major as Jurusan);
      if (profileData.body.faculty)
        form.setValue("faculty", profileData.body.faculty as Fakultas);
      if (profileData.body.cityOfOrigin)
        form.setValue("cityOfOrigin", profileData.body.cityOfOrigin);
      if (profileData.body.highschoolAlumni)
        form.setValue("highschoolAlumni", profileData.body.highschoolAlumni);
      if (profileData.body.description)
        form.setValue("description", profileData.body.description);
      if (profileData.body.gender)
        form.setValue("gender", profileData.body.gender);
      if (profileData.body.religion)
        form.setValue("religion", profileData.body.religion);
      if (profileData.body.gpa) form.setValue("gpa", profileData.body.gpa);

      // Set data file yang sudah diupload sebelumnya
      // dan update state fileNames untuk menampilkan nama file di UI
      const newFileNames: Record<string, string> = {};
      const newPreviouslyUploadedFiles: Record<string, string> = {};

      uploadFields.forEach((fieldName) => {
        // Map form field names to API response field names if needed
        const apiFieldName =
          fieldName === "phoneNumber" ? "phone_number" : fieldName;

        if (
          profileData.body[apiFieldName] &&
          typeof profileData.body[apiFieldName] === "string"
        ) {
          // Set URL file ke form state (meskipun ini URL, bukan file)
          form.setValue(fieldName, profileData.body[apiFieldName]);

          // Ekstrak nama file dari URL Cloudinary untuk ditampilkan di UI
          const fileName = profileData.body[apiFieldName].split("/").pop();
          newFileNames[fieldName] = fileName || "File sudah terupload";

          // Save the URL of previously uploaded file
          newPreviouslyUploadedFiles[fieldName] =
            profileData.body[apiFieldName];
        }
      });

      setFileNames(newFileNames);
      setPreviouslyUploadedFiles(newPreviouslyUploadedFiles);
    }
  }, [profileData, form]);

  // Mutation for updating profile
  const updateProfileMutation = useMutation({
    mutationFn: (data: MahasiswaProfileFormValues) => {
      // Replace the current form data with previously uploaded URLs for fields
      // where a file was uploaded before and no new file is being uploaded now
      const formDataWithAllFiles: any = { ...data };
      uploadFields.forEach((field) => {
        // If this field is not a File object but we have a previous upload for it,
        // reuse the previous URL
        if (
          !(formDataWithAllFiles[field] instanceof File) &&
          previouslyUploadedFiles[field]
        ) {
          formDataWithAllFiles[field] = previouslyUploadedFiles[field];
        }
      });

      return api.profile.editProfileMa({
        formData: formDataWithAllFiles,
      });
    },
    onSuccess: (_, _variables, context) => {
      toast.dismiss(context);
      toast.success("Profil berhasil diperbarui", {
        description: "Data profil Anda telah disimpan",
      });

      queryClient.invalidateQueries({
        queryKey: ["mahasiswaProfile", session?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["getReapplicationStatus"],
      });
    },
    onError: (error, _variables, context) => {
      toast.dismiss(context);
      toast.warning("Gagal memperbarui profil", {
        description: getApiErrorMessage(error, "Terjadi kesalahan"),
      });
    },
    onMutate: () => {
      const loading = toast.loading("Sedang memperbarui profil...", {
        description: "Mohon tunggu sebentar",
        duration: Infinity,
      });
      return loading;
    },
  });

  const handleFileChange = (
    field: MahasiswaProfileField,
    file: File | null,
  ) => {
    if (!isEditable) return;

    if (file) {
      setFileNames((prev) => ({
        ...prev,
        [field]: file.name,
      }));
      // Set file in form
      form.setValue(field, file);
    } else {
      // If user clears the file input
      setFileNames((prev) => {
        const newFileNames = { ...prev };
        delete newFileNames[field];
        return newFileNames;
      });

      if (previouslyUploadedFiles[field]) {
        // If there was a previously uploaded file, restore it
        form.setValue(field, previouslyUploadedFiles[field]);
      } else {
        // Clear the form value if there was no previously uploaded file
        form.setValue(field, undefined);
      }
    }
  };

  const onSubmit = (values: MahasiswaProfileFormValues) => {
    if (!isEditable) return;

    // Tambahkan validasi untuk transkrip nilai
    if (!values.transcript || !(values.transcript instanceof File)) {
      toast.warning("Validasi gagal", {
        description:
          "Transkrip nilai harus diupload ulang saat mengedit profil",
      });
      return;
    }

    const dataToSubmit = { ...values };

    // Hapus field file yang tidak diubah (masih berupa string URL)
    uploadFields.forEach((field) => {
      if (
        field !== "transcript" && // Kecualikan transkrip dari pengecualian
        typeof dataToSubmit[field] === "string" &&
        previouslyUploadedFiles[field]
      ) {
        // Jika field berupa string URL dan ada di previouslyUploadedFiles,
        // artinya tidak diubah, bisa dihapus dari data yang dikirim
        delete dataToSubmit[field];
      }
    });

    updateProfileMutation.mutate(dataToSubmit);
  };

  const watchedNim = form.watch("nim");

  useEffect(() => {
    if (watchedNim) {
      const isValidNim =
        MahasiswaProfileFormSchema.shape.nim.safeParse(watchedNim).success;

      if (isValidNim) {
        const jurusanCode = watchedNim.slice(0, 3);
        const jurusan = getNimJurusanCodeMap()[jurusanCode] || "TPB";
        const fakultasCode =
          getNimFakultasFromNimJurusanMap()[jurusanCode] || jurusanCode;
        const fakultas = getNimFakultasCodeMap()[fakultasCode];

        form.setValue("major", jurusan);
        form.setValue("faculty", fakultas);
      }
    }
  }, [watchedNim, form]);

  return (
    <div className="mx-auto w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs defaultValue="personalInfo" className="w-full">
            <TabsList className="w-full bg-placeholder">
              <TabsTrigger
                value="personalInfo"
                className="data-[state=active]:text-dark text-base font-bold text-white data-[state=active]:bg-white"
              >
                Data Diri
              </TabsTrigger>
              <TabsTrigger
                value="documents"
                className="data-[state=active]:text-dark text-base font-bold text-white data-[state=active]:bg-white"
              >
                Dokumen Pendukung
              </TabsTrigger>
            </TabsList>
            <Card className="w-full">
              <TabsContent value="personalInfo">
                <p className="text-primary px-4 py-4 text-2xl font-bold">
                  Data Diri
                </p>
                <div className="space-y-4 p-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-primary">
                          {uploadFieldLabels.name}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Masukkan nama Anda"
                            {...field}
                            disabled={!isEditable}
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
                        <FormLabel className="text-primary">
                          {uploadFieldLabels.phoneNumber}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Masukkan nomor WA Anda"
                            disabled={!isEditable || !!session?.phoneNumber}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="nim"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-primary">
                          {uploadFieldLabels.nim}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Masukkan NIM Anda"
                            {...field}
                            disabled={
                              !isEditable || session.provider === "azure"
                            }
                          />
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
                        <FormLabel className="text-primary">
                          {uploadFieldLabels.major}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Masukkan jurusan Anda"
                            {...field}
                            disabled
                          />
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
                        <FormLabel className="text-primary">
                          {uploadFieldLabels.faculty}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Masukkan fakultas Anda"
                            {...field}
                            disabled
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Gender field */}
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-primary">
                          {uploadFieldLabels.gender}
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                          disabled={!isEditable}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih jenis kelamin" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {genderOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Religion field */}
                  <FormField
                    control={form.control}
                    name="religion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-primary">
                          {uploadFieldLabels.religion}
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                          disabled={!isEditable}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih agama" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {religionOptions.map((religion) => (
                              <SelectItem key={religion} value={religion}>
                                {religion}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* GPA field */}
                  <FormField
                    control={form.control}
                    name="gpa"
                    render={({ field }) => {
                      // eslint-disable-next-line @typescript-eslint/no-unused-vars
                      const { onChange, ...rest } = field;

                      return (
                        <FormItem>
                          <FormLabel className="text-primary">
                            {uploadFieldLabels.gpa}
                          </FormLabel>
                          <p className="text-muted-foreground text-xs">
                            Gunakan tanda titik (.) untuk desimal
                          </p>
                          <FormControl>
                            <Input
                              placeholder="Masukkan IPK Anda"
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
                              disabled={!isEditable}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />

                  <FormField
                    control={form.control}
                    name="cityOfOrigin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-primary">
                          {uploadFieldLabels.cityOfOrigin}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Masukkan kota asal Anda"
                            {...field}
                            disabled={!isEditable}
                          />
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
                        <FormLabel className="text-primary">
                          {uploadFieldLabels.highschoolAlumni}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Masukkan asal SMA Anda"
                            {...field}
                            disabled={!isEditable}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-primary">
                          {uploadFieldLabels.description}
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Alasan keperluan bantuan"
                            rows={4}
                            {...field}
                            disabled={!isEditable}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
              <TabsContent value="documents">
                <p className="text-primary px-4 py-4 text-2xl font-bold">
                  Dokumen Pendukung
                </p>
                <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
                  {uploadFields.map((name) => (
                    <FormField
                      key={name}
                      control={form.control}
                      name={name}
                      render={() => {
                        const handleDragOver = (
                          e: React.DragEvent<HTMLDivElement>,
                        ) => {
                          if (!isEditable) return;

                          e.preventDefault();
                          e.stopPropagation();
                          setFileNames((prev) => ({
                            ...prev,
                            [name]: "Dragging...",
                          }));
                        };
                        const handleDragLeave = (
                          e: React.DragEvent<HTMLDivElement>,
                        ) => {
                          if (!isEditable) return;

                          e.preventDefault();
                          e.stopPropagation();
                          // Only clear if it was just showing "Dragging..."
                          if (fileNames[name] === "Dragging...") {
                            setFileNames((prev) => {
                              const newNames = { ...prev };
                              delete newNames[name];
                              return newNames;
                            });
                          }
                        };
                        const handleDrop = (
                          e: React.DragEvent<HTMLDivElement>,
                        ) => {
                          if (!isEditable) return;

                          e.preventDefault();
                          e.stopPropagation();
                          const file = e.dataTransfer.files?.[0] || null;
                          handleFileChange(name, file);
                        };

                        const hasExistingFile = !!previouslyUploadedFiles[name];

                        // Determine display status message
                        let fileStatus = "";
                        if (fileNames[name] === "Dragging...") {
                          fileStatus = "Dragging...";
                        } else if (fileNames[name]) {
                          fileStatus = fileNames[name];
                        } else if (hasExistingFile) {
                          fileStatus = "File sudah terupload";
                        } else {
                          fileStatus = isEditable
                            ? "Klik untuk upload atau drag & drop"
                            : "Tidak ada file";
                        }

                        // URL for previously uploaded file
                        const fileUrl = hasExistingFile
                          ? previouslyUploadedFiles[name]
                          : null;

                        // Tambahkan pesan informasi khusus untuk transkrip
                        const isTranscript = name === "transcript";

                        return (
                          <FormItem
                            className={cn(
                              name === "ditmawaRecommendationLetter" &&
                              "col-span-1 md:col-span-2",
                            )}
                          >
                            <FormLabel className="text-primary text-sm">
                              {uploadFieldLabels[name] || name}
                              {isTranscript && isEditable && (
                                <span className="ml-1 text-xs text-red-500">
                                  *wajib diupload ulang
                                </span>
                              )}
                            </FormLabel>
                            <FormControl>
                              <div
                                className={`flex flex-col items-center justify-center rounded-md border-2 ${!isEditable
                                    ? "cursor-not-allowed border-gray-200 bg-gray-50"
                                    : fileNames[name] === "Dragging..."
                                      ? "border-primary bg-primary/5 border-dashed"
                                      : hasExistingFile
                                        ? "border-dashed border-green-500/50 bg-green-50/20"
                                        : "border-muted-foreground/25 hover:border-muted-foreground/50 border-dashed"
                                  } p-6 transition-all`}
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
                                  }}
                                  ref={(el) => {
                                    fileInputRefs.current[name] = el;
                                  }}
                                  disabled={!isEditable}
                                />
                                <div className="flex flex-col items-center gap-2 text-center">
                                  <FileUp
                                    className={`h-8 w-8 ${!isEditable
                                        ? "text-gray-400"
                                        : hasExistingFile
                                          ? "text-green-500"
                                          : "text-muted-foreground"
                                      }`}
                                  />

                                  {/* Display status message without showing the filename for uploaded files */}
                                  <p className="text-sm font-medium">
                                    {hasExistingFile
                                      ? "File sudah terupload"
                                      : fileStatus}
                                  </p>

                                  <div className="flex gap-2">
                                    {hasExistingFile && (
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          if (fileUrl)
                                            window.open(fileUrl, "_blank");
                                        }}
                                        disabled={!fileUrl}
                                      >
                                        Lihat
                                      </Button>
                                    )}
                                    {isEditable && (
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                          fileInputRefs.current[name]?.click()
                                        }
                                        disabled={!isEditable}
                                      >
                                        {hasExistingFile ? `Ganti` : `Pilih`}
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
              </TabsContent>
            </Card>
          </Tabs>

          {/* Show form actions only if editing is enabled */}
          {isEditable && (
            <div className="flex justify-end space-x-2 p-4">
              <Button
                type="button"
                className="w-24 xl:w-40"
                variant="outline"
                onClick={() => {
                  setIsEditingEnabled(false);
                }}
                disabled={form.formState.isSubmitting}
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="w-24 xl:w-40"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
};

export default ProfileFormMA;
