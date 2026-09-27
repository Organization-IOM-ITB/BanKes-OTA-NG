import Metadata from "@/components/metadata";
import { OrangTuaRegistrationSchema } from "@/lib/zod/profile";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import OTAPageOne from "./ota-page-one";
import OTAPageTwo from "./ota-page-two";

export type OrangTuaRegistrationFormValues = z.infer<
  typeof OrangTuaRegistrationSchema
>;

function PendaftaranOrangTua() {
  const [page, setPage] = useState(1);

  const form = useForm<OrangTuaRegistrationFormValues>({
    resolver: zodResolver(OrangTuaRegistrationSchema),
  });

  return (
    <main className="flex min-h-[calc(100vh-70px)] flex-col gap-4 p-2 px-6 py-16 md:px-12 lg:min-h-[calc(100vh-96px)]">
      <Metadata title="Pendaftaran | OTA-Ku" />
      {page === 1 ? (
        <OTAPageOne setPage={setPage} mainForm={form} />
      ) : (
        <OTAPageTwo setPage={setPage} mainForm={form} />
      )}
    </main>
  );
}

export default PendaftaranOrangTua;
