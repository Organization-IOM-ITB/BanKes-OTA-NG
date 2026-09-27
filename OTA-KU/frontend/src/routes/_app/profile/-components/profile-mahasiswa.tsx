import { api } from "@/api/client";
import { UserSchema } from "@/api/generated";
import Metadata from "@/components/metadata";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { UserCog } from "lucide-react";
import { useState } from "react";

import ProfileCard from "./profile-card";
import ChangePasswordForm from "./profile-change-password";
import ProfileFormMA from "./profile-form-ma";

function ProfileMahasiswa({
  session,
  applicationStatus,
}: {
  session: UserSchema;
  applicationStatus:
    | "accepted"
    | "rejected"
    | "pending"
    | "unregistered"
    | "reapply"
    | "outdated";
}) {
  const [isEditingEnabled, setIsEditingEnabled] = useState(false);

  const { data: profileData, isLoading } = useQuery({
    queryKey: ["mahasiswaProfile", session.id],
    queryFn: () => api.profile.profileMahasiswa({ id: session.id }),
    enabled: !!session.id,
  });

  const { data } = useQuery({
    queryKey: ["getReapplicationStatus", session?.id],
    queryFn: () => {
      if (!session?.id) return null;
      return api.status.getReapplicationStatus({
        id: session.id,
      });
    },
    enabled: !!session?.id,
  });

  if (
    applicationStatus === "unregistered" ||
    applicationStatus === "outdated"
  ) {
    return (
      <main className="flex min-h-[calc(100vh-96px)] flex-col items-center justify-center gap-4 p-2 px-6 py-8 md:px-12">
        <Metadata title="Profile | OTA-Ku" />
        <UserCog className="text-primary h-24 w-24" />
        <h2 className="text-2xl font-semibold">
          Anda belum melakukan pendaftaran
        </h2>
      </main>
    );
  }

  return (
    <main className="flex min-h-[calc(100vh-96px)] flex-col p-2 px-6 py-8 md:px-12">
      <Metadata title="Profile | OTA-Ku" />
      <p className="text-primary mb-6 text-4xl font-bold">Profile</p>
      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        <div>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-52 w-full" />
            </div>
          ) : (
            <ProfileCard
              name={profileData?.body?.name || "Mahasiswa Asuh"}
              role="Mahasiswa"
              email={session.email}
              phone={
                profileData?.body?.phone_number || session.phoneNumber || "-"
              }
              joinDate={profileData?.body?.createdAt || "-"}
              dueNextUpdateAt={profileData?.body?.dueNextUpdateAt}
              applicationStatus={applicationStatus}
              status={data?.body.status || false}
              daysRemaining={data?.body.daysRemaining || 0}
            />
          )}
        </div>
        <div className="space-y-6">
          <ProfileFormMA
            session={session}
            isEditable={isEditingEnabled && data?.body.status}
            setIsEditingEnabled={setIsEditingEnabled}
          />
          {/* Only show change password form for credentials provider */}
          {session.provider === "credentials" && (
            <ChangePasswordForm userId={session.id} />
          )}
        </div>
      </div>
    </main>
  );
}

export default ProfileMahasiswa;
