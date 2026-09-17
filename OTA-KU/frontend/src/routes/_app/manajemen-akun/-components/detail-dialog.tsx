import { AllAccountListElement } from "@/api/generated";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import DetailAdmin from "./detail-admin";
import DetailMahasiswa from "./detail-mahasiswa";
import DetailOta from "./detail-ota";

function DetailDialog({ account }: { account: AllAccountListElement }) {
  return (
    <DialogContent className="flex max-h-8/12 flex-col sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold text-dark">
          Detail Info
        </DialogTitle>
      </DialogHeader>

      {account.type === "mahasiswa" ? (
        <DetailMahasiswa account={account} />
      ) : account.type === "ota" ? (
        <DetailOta account={account} />
      ) : (
        <DetailAdmin account={account} />
      )}
    </DialogContent>
  );
}

export default DetailDialog;
