import { AllAccountListElement } from "@/api/generated";
import { Button } from "@/components/ui/button";
import { formatValue } from "@/lib/formatter";

import { linkColumns, mahasiswaColumns } from "./constant";

function DetailMahasiswa({ account }: { account: AllAccountListElement }) {
  return (
    <section className="flex flex-1 flex-col overflow-y-scroll">
      {Object.entries(mahasiswaColumns).map(([key, value]) => (
        <div
          className="grid grid-cols-1 gap-2 border-b border-b-placeholder py-2 sm:grid-cols-2"
          key={key}
        >
          <p className="font-bold">{value}</p>
          <>
            {linkColumns.includes(key) ? (
              <Button asChild className="place-self-start" variant={"outline"}>
                <a
                  href={String(account[key as keyof typeof account] ?? "#")}
                  rel="noreferrer"
                  target="_blank"
                >
                  Unduh
                </a>
              </Button>
            ) : key === "name" ? (
              <p className="line-clamp-1 text-dark sm:line-clamp-none">
                {formatValue(key, account.ma_name ?? "-")}
              </p>
            ) : (
              <p className="line-clamp-1 text-dark sm:line-clamp-none">
                {formatValue(key, account[key as keyof typeof account] ?? "-")}
              </p>
            )}
          </>
        </div>
      ))}
    </section>
  );
}

export default DetailMahasiswa;
