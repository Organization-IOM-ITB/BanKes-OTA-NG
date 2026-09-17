import { TransactionListVerificationAdminData } from "@/api/generated";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatFunding } from "@/lib/formatter";
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDown, ChevronRight } from "lucide-react";
import * as React from "react";

import DaftarTagihanForm from "./daftar-tagihan-form";

// Types based on your API response
export type TransactionStatus = "unpaid" | "pending" | "paid";

type Transaction = {
  mahasiswa_id: string;
  name_ma: string;
  nim_ma: string;
  paidAt: string;
  dueDate: string;
  bill: number;
  receipt: string;
  rejectionNote: string;
  transactionStatus: TransactionStatus;
};

const getOTAStatusSummary = (transactions: Transaction[]) => {
  const paid = transactions.filter(
    (t) => t.transactionStatus === "paid",
  ).length;
  const pending = transactions.filter(
    (t) => t.transactionStatus === "pending",
  ).length;
  const unpaid = transactions.filter(
    (t) => t.transactionStatus === "unpaid",
  ).length;

  return { paid, pending, unpaid, total: transactions.length };
};

interface CollapsibleDataTableProps {
  data: TransactionListVerificationAdminData[];
}

export function CollapsibleDataTable({ data }: CollapsibleDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [openRows, setOpenRows] = React.useState<Set<string>>(new Set());

  const toggleRow = (otaId: string) => {
    const newOpenRows = new Set(openRows);
    if (newOpenRows.has(otaId)) {
      newOpenRows.delete(otaId);
    } else {
      newOpenRows.add(otaId);
    }
    setOpenRows(newOpenRows);
  };

  const columns: ColumnDef<TransactionListVerificationAdminData>[] = [
    {
      id: "expand",
      header: "",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={() => toggleRow(row.original.ota_id)}
        >
          {openRows.has(row.original.ota_id) ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      ),
    },
    {
      accessorKey: "name_ota",
      header: () => <span className="text-dark">Orang Tua Asuh</span>,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{row.getValue("name_ota")}</span>
        </div>
      ),
    },
    {
      accessorKey: "number_ota",
      header: () => <span className="text-dark">No. Telepon</span>,
      cell: ({ row }) => (
        <span className="text-sm">+{row.getValue("number_ota")}</span>
      ),
    },
    {
      accessorKey: "totalBill",
      header: () => <span className="text-dark">Total Tagihan</span>,
      cell: ({ row }) => (
        <span className="font-semibold">
          {formatFunding(row.getValue("totalBill"))}
        </span>
      ),
    },
    {
      id: "status",
      header: () => <span className="text-dark">Status Transaksi</span>,
      cell: ({ row }) => {
        const statusSummary = getOTAStatusSummary(row.original.transactions);
        return (
          <div className="flex gap-1">
            {statusSummary.paid > 0 && (
              <Badge
                variant="default"
                className="bg-green-100 text-xs text-green-800"
              >
                {statusSummary.paid} Telah Dibayar
              </Badge>
            )}
            {statusSummary.pending > 0 && (
              <Badge
                variant="secondary"
                className="bg-yellow-100 text-xs text-yellow-800"
              >
                {statusSummary.pending} Menunggu Verifikasi
              </Badge>
            )}
            {statusSummary.unpaid > 0 && (
              <Badge
                variant="destructive"
                className="bg-red-100 text-xs text-red-800"
              >
                {statusSummary.unpaid} Belum Dibayar
              </Badge>
            )}
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  React.useEffect(() => {
    table.getColumn("id")?.toggleVisibility(false);
  }, [table]);

  return (
    <div>
      <Table>
        <TableHeader className="bg-white">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className="border-b-dark border-b hover:bg-white"
            >
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="py-4 text-sm text-placeholder"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody className="border-b-dark border-b">
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <Collapsible
                key={row.id}
                open={openRows.has(row.original.ota_id)}
                onOpenChange={() => toggleRow(row.original.ota_id)}
                asChild
              >
                <>
                  <TableRow
                    data-state={row.getIsSelected() && "selected"}
                    className="border-b-dark text-dark border-b text-sm font-medium"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-4">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                  <CollapsibleContent asChild>
                    <TableRow>
                      <TableCell colSpan={columns.length} className="p-0">
                        <DaftarTagihanForm row={row} />
                      </TableCell>
                    </TableRow>
                  </CollapsibleContent>
                </>
              </Collapsible>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="text-dark h-24 text-center"
              >
                Tidak ada data yang ditemukan.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
