import { api } from "@/api/client";
import type { ListTerminateForOTA } from "@/api/generated";
import Metadata from "@/components/metadata";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { SessionContext } from "@/context/session";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";

export const Route = createFileRoute("/_app/daftar/terminasi-mahasiswa/")({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    const user = context.session;

    if (!user) {
      throw redirect({ to: "/auth/login" });
    }

    if (user.type !== "ota") {
      throw redirect({ to: "/" });
    }

    const verificationStatus = await api.status
      .getVerificationStatus({
        id: user.id,
      })
      .catch(() => null);

    if (!verificationStatus) {
      throw redirect({ to: "/auth/login" });
    }

    if (verificationStatus.body.status !== "verified") {
      throw redirect({ to: "/auth/otp-verification" });
    }

    return { user };
  },
});

interface StudentCardProps {
  student: ListTerminateForOTA;
  onTerminateSuccess: (studentId: string) => void;
}

function StudentCard({ student, onTerminateSuccess }: StudentCardProps) {
  const session = useContext(SessionContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [note, setNote] = useState("");

  const deleteConnection = useMutation({
    mutationFn: (data: { maId: string; requestTerminationNote: string }) => {
      return api.terminate.requestTerminateFromOta({
        formData: {
          otaId: session?.id ? session.id : "",
          mahasiswaId: data.maId,
          requestTerminationNote: data.requestTerminationNote,
        },
      });
    },
    onSuccess: (_, _variables, context) => {
      toast.dismiss(context);
      setIsModalOpen(false);
      onTerminateSuccess(student.mahasiswaId);
      toast.success(
        "Berhasil melakukan permintaan pemutusan hubungan dengan mahasiswa asuh",
        {
          description: "Permintaan akan segera diproses oleh IOM ITB",
        },
      );
    },
    onError: (error, _variables, context) => {
      toast.dismiss(context);
      toast.warning(
        "Gagal melakukan permintaan pemutusan hubungan dengan mahasiswa asuh",
        {
          description: error.message,
        },
      );
    },
    onMutate: () => {
      const loading = toast.loading("Sedang memproses permintaan...", {
        description: "Mohon tunggu sebentar",
        duration: Infinity,
      });
      return loading;
    },
  });

  const handleTerminate = (note: string) => {
    deleteConnection.mutate({
      maId: student.mahasiswaId,
      requestTerminationNote: note,
    });
  };

  return (
    <Card
      className={`w-full rounded-lg p-6 shadow-sm ${student.requestTerminateOta ? "border-l-4 border-l-amber-500 bg-gray-50" : "bg-white"}`}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{student.maName}</h2>
          <p className="text-xl text-gray-500">{`${student.maNIM.slice(0, 5)}XXX`}</p>
          <p className="mt-2 text-gray-500">
            Masa asuh aktif sejak:{" "}
            <span className="font-semibold">
              {new Date(student.createdAt).toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </span>
          </p>

          {student.requestTerminateOta && (
            <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 md:mr-5">
              <h3 className="font-semibold text-amber-800">
                Alasan Terminasi:
              </h3>
              <p className="mt-1 text-gray-700">
                {student.requestTerminationNoteOTA}
              </p>
            </div>
          )}
        </div>

        {student.requestTerminateOta ? (
          <Button variant="destructive" className="rounded-md" disabled>
            Menunggu Persetujuan
          </Button>
        ) : (
          <Button
            variant="destructive"
            className="flex items-center gap-2 rounded-md bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600 focus:ring-2 focus:ring-red-300 focus:outline-none active:bg-red-700"
            onClick={() => setIsModalOpen(true)}
          >
            <img
              src={`${import.meta.env.BASE_URL}icon/Type=remove.svg`}
              alt="Terminate"
              className="h-5 w-5"
            />
            Ajukan Berhenti
          </Button>
        )}
      </div>

      {/* Confirmation Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              Konfirmasi Terminasi
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin mengakhiri hubungan dengan mahasiswa asuh{" "}
              <span className="font-bold">{student.maName}</span>?
            </DialogDescription>
            <DialogDescription>
              <span></span>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Masukkan alasan terminasi (wajib)"
              />
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="flex-1"
              disabled={deleteConnection.isPending}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => handleTerminate(note)}
              disabled={deleteConnection.isPending}
              className="flex-1"
            >
              Ya, Terminasi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function RouteComponent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery] = useDebounce(searchQuery, 500);
  const queryClient = useQueryClient();

  const [localStudents, setLocalStudents] = useState<ListTerminateForOTA[]>([]);

  const { data: activeStudentsData, isSuccess: isActiveSuccess } = useQuery({
    queryKey: ["listTerminateForOta", debouncedSearchQuery],
    queryFn: () =>
      api.terminate.listTerminateForOta({
        q: debouncedSearchQuery,
        page: 1,
      }),
  });

  // Update local state when activeStudentsData changes
  useEffect(() => {
    if (activeStudentsData?.body?.data) {
      setLocalStudents(activeStudentsData.body.data);
    }
  }, [activeStudentsData]);

  // Handle student termination success
  const handleTerminateSuccess = (studentId: string) => {
    // Update local state immediately
    setLocalStudents((prevStudents) =>
      prevStudents.filter((student) => student.mahasiswaId !== studentId),
    );

    queryClient.invalidateQueries({
      queryKey: ["listTerminateForOta", debouncedSearchQuery],
    });
  };

  const isLoading = !isActiveSuccess;

  return (
    <main className="flex min-h-[calc(100vh-70px)] flex-col p-2 px-6 py-8 md:px-12 lg:min-h-[calc(100vh-96px)]">
      <Metadata title="Terminasi Mahasiswa Asuh Saya | BOTA" />
      <h1 className="mb-6 text-3xl font-bold text-primary">
        Terminasi Hubungan Mahasiswa Asuh Saya
      </h1>

      <div className="relative mb-6">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          placeholder="Cari nama"
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {isLoading ? (
        <Skeleton className="h-80 w-full" />
      ) : localStudents.length > 0 ? (
        <div className="flex w-full flex-col gap-4">
          {localStudents.map((student) => (
            <StudentCard
              key={student.mahasiswaId}
              student={student}
              onTerminateSuccess={handleTerminateSuccess}
            />
          ))}
        </div>
      ) : (
        <div className="text-muted-foreground py-8 text-center">
          Tidak ada mahasiswa untuk ditampilkan
        </div>
      )}
    </main>
  );
}
