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
    label: "Menunggu Konfirmasi",
  },
  {
    value: "accepted",
    label: "Aktif",
  },
];

interface FilterConnectionStatusProps {
  status: "accepted" | "pending" | "rejected" | null;
  setStatus: (status: "accepted" | "pending" | "rejected" | null) => void;
}

function FilterConnectionStatus({
  status,
  setStatus,
}: FilterConnectionStatusProps) {
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
            "hover:bg-accent focus-visible:ring-ring data-[state=open]:bg-accent data-[state=open]:text-accent-foreground hover:text-accent-foreground w-full justify-between rounded-md border border-placeholder bg-white text-placeholder shadow-xs focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 sm:max-w-[250px]",
            value ? "text-accent-foreground" : "text-placeholder",
          )}
        >
          {value
            ? statuses.find((status) => status.value === value)?.label
            : "Filter Status Hubungan Asuh"}
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

export default FilterConnectionStatus;
