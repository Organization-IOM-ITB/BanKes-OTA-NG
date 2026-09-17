import { AllAccountListElement } from "@/api/generated";
import { formatValue } from "@/lib/formatter";

import { otaColumns } from "./constant";

function DetailOta({ account }: { account: AllAccountListElement }) {
  return (
    <section className="flex flex-1 flex-col overflow-y-scroll">
      {account.applicationStatus === "unregistered" ? (
        <p>Belum terdaftar</p>
      ) : (
        Object.entries(otaColumns).map(([key, value]) => (
          <div
            className="grid grid-cols-1 gap-2 border-b border-b-placeholder py-2 sm:grid-cols-2"
            key={key}
          >
            {key === "name" ? (
              <>
                <p className="font-bold">{value}</p>
                <p className="line-clamp-1 text-dark sm:line-clamp-none">
                  {formatValue(
                    key,
                    account.ota_name === "" ? "-" : (account.ota_name ?? "-"),
                  )}
                </p>
              </>
            ) : (
              <>
                <p className="font-bold">{value}</p>
                <p className="line-clamp-1 text-dark sm:line-clamp-none">
                  {formatValue(
                    key,
                    account[key as keyof typeof account] === ""
                      ? "-"
                      : (account[key as keyof typeof account] ?? "-"),
                  )}
                </p>
              </>
            )}
          </div>
        ))
      )}
    </section>
  );
}

export default DetailOta;
