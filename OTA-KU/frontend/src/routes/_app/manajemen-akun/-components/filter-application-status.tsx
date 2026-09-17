import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

const statuses = [
  {
    value: "pending",
    label: "Tertunda",
  },
  {
    value: "accepted",
    label: "Terverifikasi",
  },
  {
    value: "rejected",
    label: "Tertolak",
  },
  {
    value: "reapply",
    label: "Pengajuan Ulang",
  },
  {
    value: "outdated",
    label: "Kedaluarsa",
  },
  {
    value: "unregistered",
    label: "Belum Terdaftar",
  },
];

interface FilterApplicationStatusProps {
  status:
    | "accepted"
    | "pending"
    | "rejected"
    | "reapply"
    | "outdated"
    | "unregistered"
    | null;
  setStatus: (
    status:
      | "accepted"
      | "pending"
      | "rejected"
      | "reapply"
      | "outdated"
      | "unregistered"
      | null,
  ) => void;
}

function FilterApplicationStatus({
  status,
  setStatus,
}: FilterApplicationStatusProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  useEffect(() => {
    if (status) {
      setValue(status);
    }
  }, [status]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "hover:bg-accent focus-visible:ring-ring data-[state=open]:bg-accent data-[state=open]:text-accent-foreground hover:text-accent-foreground justify-between rounded-md border border-placeholder bg-white text-placeholder shadow-xs focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
            value ? "text-accent-foreground" : "text-placeholder",
          )}
        >
          {value
            ? statuses.find((status) => status.value === value)?.label
            : "Filter Status Pendaftaran"}
          <ChevronDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command>
          <CommandList>
            <CommandGroup>
              {statuses.map((status) => (
                <CommandItem
                  key={status.value}
                  value={status.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue);
                    setStatus(
                      currentValue === value
                        ? null
                        : (currentValue as "accepted" | "pending" | "rejected"),
                    );
                    setOpen(false);
                  }}
                >
                  {status.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === status.value ? "opacity-100" : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default FilterApplicationStatus;
