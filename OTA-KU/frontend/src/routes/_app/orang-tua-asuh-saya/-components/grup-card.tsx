import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { censorEmail } from "@/lib/formatter";
import type { MaOtaGroup } from "@/types/group";
import { Calendar, CircleDollarSign, Mail, Phone, Users } from "lucide-react";

interface GrupCardProps {
  grup: MaOtaGroup;
}

function GrupCard({ grup }: GrupCardProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-primary" />
        <span className="font-semibold text-primary">{grup.groupName}</span>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            grup.groupStatus === "active"
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {grup.groupStatus === "active" ? "Aktif" : "Terbentuk"}
        </span>
      </div>

      {grup.members.map((member) => (
        <Card key={member.otaId} className="w-full">
          <CardHeader className="flex flex-col items-center justify-center pt-6 pb-4">
            <div className="mb-4 h-24 w-24 overflow-hidden rounded-full bg-gray-100">
              <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-gray-400">
                {member.name.charAt(0)}
              </div>
            </div>
            <div className="text-center">
              <h2 className="text-lg font-bold xl:text-xl">{member.name}</h2>
              <p className="text-muted-foreground">Orang Tua Asuh</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-primary space-y-3 text-sm xl:text-base">
              <div className="flex items-start space-x-3">
                <Mail className="text-muted-foreground h-5 w-5 shrink-0" />
                <a
                  href={member.isDetailVisible ? `mailto:${member.email}` : "#"}
                  target={member.isDetailVisible ? "_blank" : "_self"}
                  className="text-sm"
                >
                  {member.isDetailVisible
                    ? member.email
                    : censorEmail(member.email)}
                </a>
              </div>
              <div className="flex items-start space-x-3">
                <Phone className="text-muted-foreground h-5 w-5 shrink-0" />
                <a
                  href={
                    member.isDetailVisible
                      ? `https://wa.me/${member.phoneNumber}`
                      : "#"
                  }
                  target={member.isDetailVisible ? "_blank" : "_self"}
                  className="text-sm"
                >
                  +{member.isDetailVisible ? member.phoneNumber : "**********"}
                </a>
              </div>
              {grup.transferDate && (
                <div className="flex items-start space-x-3">
                  <CircleDollarSign className="text-muted-foreground min-h-5 min-w-5 shrink-0" />
                  <span className="text-sm">
                    Bantuan dikirim tanggal {grup.transferDate} untuk setiap
                    bulan
                  </span>
                </div>
              )}
              <div className="flex items-start space-x-3">
                <Calendar className="text-muted-foreground h-5 w-5 shrink-0" />
                <span className="text-sm">
                  Bergabung sejak{" "}
                  {new Date(member.joinedAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default GrupCard;
