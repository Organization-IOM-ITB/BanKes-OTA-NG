import { api } from "@/api/client";
import { getApiErrorMessage } from "@/lib/api-error";
import { UserSchema } from "@/api/generated";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { OrangTuaRegistrationSchema } from "@/lib/zod/profile";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

type OrangTuaRegistrationFormValues = z.infer<
  typeof OrangTuaRegistrationSchema
>;

interface ProfileFormProps {
  session: UserSchema;
}

const ProfileFormOTA: React.FC<ProfileFormProps> = ({ session }) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [isEditingEnabled, setIsEditingEnabled] = useState(false);
  const queryClient = useQueryClient();

  // Create form with zod validation
  const form = useForm<OrangTuaRegistrationFormValues>({
    resolver: zodResolver(OrangTuaRegistrationSchema),
    defaultValues: {
      name: "",
      job: "",
      address: "",
      linkage: "none",
      funds: 300000,
      maxCapacity: 1,
      startDate: new Date().toISOString().split("T")[0], // Format: YYYY-MM-DD
      maxSemester: 1,
      transferDate: 1,
      criteria: "",
    },
  });

  // Fetch existing profile data
  const { data: profileData } = useQuery({
    queryKey: ["otaProfile", session?.id],
    queryFn: () => api.profile.profileOrangTua({ id: session?.id ?? "" }),
    enabled: !!session?.id,
  });

  // Set form values once profile data is loaded
  useEffect(() => {
    if (profileData?.body) {
      // Set basic profile data
      form.setValue("name", profileData.body.name || "");

      // Check if we have additional details through an API call
      // This is a placeholder - we need to check how the API actually returns OTA details
      api.profile
        .profileOrangTua({ id: session?.id ?? "" })
        .then((response) => {
          const otaDetails = response.body;

          if (otaDetails) {
            // Set all available values from API
            if (otaDetails.job) form.setValue("job", otaDetails.job);
            if (otaDetails.address)
              form.setValue("address", otaDetails.address);
            if (otaDetails.linkage)
              form.setValue(
                "linkage",
                otaDetails.linkage as
                | "otm"
                | "dosen"
                | "alumni"
                | "lainnya"
                | "none",
              );
            if (otaDetails.funds) form.setValue("funds", otaDetails.funds);
            if (otaDetails.maxCapacity)
              form.setValue("maxCapacity", otaDetails.maxCapacity);
            if (otaDetails.startDate) {
              form.setValue("startDate", otaDetails.startDate);
              // Also set the date picker state
              try {
                setSelectedDate(new Date(otaDetails.startDate));
              } catch (e) {
                console.error("Failed to parse date:", e);
              }
            }
            if (otaDetails.maxSemester)
              form.setValue("maxSemester", otaDetails.maxSemester);
            if (otaDetails.transferDate)
              form.setValue("transferDate", otaDetails.transferDate);
            if (otaDetails.criteria)
              form.setValue("criteria", otaDetails.criteria);
          }
        })
        .catch((error) => {
          console.error("Error fetching OTA details:", error);
        });
    }
  }, [profileData, form, session?.id]);

  // Mutation for updating profile
  const updateProfileMutation = useMutation({
    mutationFn: (data: OrangTuaRegistrationFormValues) =>
      api.profile.editProfileOta({
        formData: data,
        id: session?.id ?? "",
      }),
    onSuccess: (_, _variables, context) => {
      toast.dismiss(context);
      toast.success("Profil berhasil diperbarui", {
        description: "Data profil Anda telah disimpan",
      });
      // Invalidate profile query to refresh data
      queryClient.invalidateQueries({
        queryKey: ["otaProfile", session.id],
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

  const onSubmit = (values: OrangTuaRegistrationFormValues) => {
    updateProfileMutation.mutate(values);
  };

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
                value="sponsorshipDetails"
                className="data-[state=active]:text-dark text-base font-bold text-white data-[state=active]:bg-white"
              >
                Detail Pendaftaran
              </TabsTrigger>
            </TabsList>

            <Card className="w-full">
              {/* Personal Info Tab */}
              <TabsContent value="personalInfo">
                <div className="space-y-4 p-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-primary">
                          Nama Lengkap
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nama Lengkap"
                            disabled={!isEditingEnabled}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="job"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-primary">
                          Pekerjaan
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Pekerjaan"
                            disabled={!isEditingEnabled}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-primary">Alamat</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Alamat"
                            disabled={!isEditingEnabled}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="linkage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-primary">
                          Keterkaitan dengan ITB
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={!isEditingEnabled}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full bg-white">
                              <SelectValue placeholder="Pilih" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="alumni">Alumni</SelectItem>
                            <SelectItem value="otm">
                              Orang Tua Mahasiswa
                            </SelectItem>
                            <SelectItem value="dosen">Dosen</SelectItem>
                            <SelectItem value="lainnya">Lainnya</SelectItem>
                            <SelectItem value="none">Tidak Ada</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              {/* Sponsorship Details Tab */}
              <TabsContent value="sponsorshipDetails">
                <div className="space-y-4 p-4">
                  <FormField
                    control={form.control}
                    name="funds"
                    render={({ field }) => {
                      // eslint-disable-next-line @typescript-eslint/no-unused-vars
                      const { onChange, ...rest } = field;

                      return (
                        <FormItem>
                          <FormLabel className="text-primary">
                            Bersedia memberikan dana setiap bulan sebesar (dalam
                            Rp)
                          </FormLabel>
                          <FormControl>
                            <Input
                              disabled={!isEditingEnabled}
                              placeholder="Minimal Rp 300.000"
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
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                  <FormField
                    control={form.control}
                    name="maxCapacity"
                    render={({ field }) => {
                      // eslint-disable-next-line @typescript-eslint/no-unused-vars
                      const { onChange, ...rest } = field;

                      return (
                        <FormItem>
                          <FormLabel className="text-primary">
                            Jumlah Anak Asuh Maksimal
                          </FormLabel>
                          <FormControl>
                            <Input
                              disabled={!isEditingEnabled}
                              placeholder="Jumlah anak asuh"
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
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-primary">
                          Dana akan mulai diberikan pada
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild disabled={!isEditingEnabled}>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "border-input placeholder:text-muted-foreground flex h-9 w-full min-w-0 justify-start rounded-md border bg-white px-3 py-1 text-base text-black shadow-xs transition-[color,box-shadow] outline-none md:text-sm",
                                  "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                                  "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
                                  !selectedDate && "text-muted-foreground",
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {selectedDate ? (
                                  format(selectedDate, "PPP")
                                ) : (
                                  <span>Pilih tanggal</span>
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={selectedDate}
                              onSelect={(date) => {
                                setSelectedDate(date);
                                if (date) {
                                  field.onChange(format(date, "yyyy-MM-dd"));
                                }
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="maxSemester"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-primary">
                          Semester Maksimal
                        </FormLabel>
                        <FormControl>
                          <Input
                            disabled={!isEditingEnabled}
                            placeholder="Min. 1 semester"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="transferDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-primary">
                          Dana akan ditransfer ke rekening IOM setiap tanggal
                        </FormLabel>
                        <FormControl>
                          <Input
                            disabled={!isEditingEnabled}
                            placeholder="Tanggal (1-28)"
                            min={1}
                            max={28}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="criteria"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-primary">
                          Adapun Kriteria Anak Asuh yang Diinginkan
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            disabled={!isEditingEnabled}
                            placeholder="Contoh: Jenis kelamin, fakultas, agama, dll."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
            </Card>
          </Tabs>

          <div className="flex justify-end space-x-2 p-4">
            {isEditingEnabled ? (
              <>
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
              </>
            ) : (
              <Button
                type="button"
                className="w-24 xl:w-40"
                onClick={() => setIsEditingEnabled(true)}
              >
                Edit Profil
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ProfileFormOTA;
