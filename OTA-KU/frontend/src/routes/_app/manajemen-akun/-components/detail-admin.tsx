import { AllAccountListElement } from "@/api/generated";
import { formatValue } from "@/lib/formatter";

import { adminColumns } from "./constant";

function DetailAdmin({ account }: { account: AllAccountListElement }) {
  return (
    <section className="flex flex-1 flex-col overflow-y-scroll">
      {Object.entries(adminColumns).map(([key, value]) => (
        <div
          className="grid grid-cols-1 gap-2 border-b border-b-placeholder py-2 sm:grid-cols-2"
          key={key}
        >
          <p className="font-bold">{value}</p>
          <>
            {key === "name" ? (
              <p className="line-clamp-1 text-dark sm:line-clamp-none">
                {formatValue(key, account.admin_name ?? "-")}
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

export default DetailAdmin;
