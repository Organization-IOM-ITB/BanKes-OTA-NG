import { api } from "@/api/client";
import { UserSchema } from "@/api/generated";
import Metadata from "@/components/metadata";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { UserCog } from "lucide-react";

import ProfileCard from "./profile-card";
import ChangePasswordForm from "./profile-change-password";
import ProfileFormOTA from "./profile-form-ota";

const normalizeLinkage = (
  linkage?: string,
): "alumni" | "otm" | "dosen" | "lainnya" | "none" | undefined => {
  if (!linkage) return undefined;

  if (
    linkage === "alumni" ||
    linkage === "otm" ||
    linkage === "dosen" ||
    linkage === "lainnya" ||
    linkage === "none"
  ) {
    return linkage;
  }

  return "none";
};

function ProfileOta({
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
  const { data: profileData, isLoading } = useQuery({
    queryKey: ["otaProfile", session.id],
    queryFn: () => api.profile.profileOrangTua({ id: session.id ?? "" }),
    enabled: !!session.id,
  });

  // console.log("ProfileOTA - profileData:", profileData);
  // console.log("ProfileOTA - linkage value:", profileData?.body?.linkage);

  if (
    applicationStatus === "unregistered" ||
    applicationStatus === "outdated"
  ) {
    return (
      <main className="flex min-h-[calc(100vh-70px)] flex-col items-center justify-center gap-4 p-2 px-6 py-8 md:px-12 lg:min-h-[calc(100vh-96px)]">
        <Metadata title="Profile | OTA-Ku" />
        <UserCog className="text-primary h-24 w-24" />
        <h2 className="text-2xl font-semibold">
          Anda belum melakukan pendaftaran
        </h2>
      </main>
    );
  }

  return (
    <main className="flex min-h-[calc(100vh-70px)] flex-col p-2 px-6 py-8 md:px-12 lg:min-h-[calc(100vh-96px)]">
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
              name={profileData?.body?.name || "Orang Tua Asuh"}
              role="Orang Tua Asuh"
              email={session.email}
              phone={
                profileData?.body?.phone_number || session.phoneNumber || "-"
              }
              linkage={normalizeLinkage(profileData?.body?.linkage)}
              joinDate={profileData?.body?.join_date || "Belum tersedia"}
              status={false}
              daysRemaining={0}
            />
          )}
        </div>
        <div className="space-y-6">
          <ProfileFormOTA session={session} />
          {/* Only show change password form for credentials provider */}
          {session.provider === "credentials" && (
            <ChangePasswordForm userId={session.id} />
          )}
        </div>
      </div>
    </main>
  );
}

export default ProfileOta;
