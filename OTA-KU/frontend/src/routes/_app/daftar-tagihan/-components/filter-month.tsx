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

const months = [
  { value: 1, label: "Januari" },
  { value: 2, label: "Februari" },
  { value: 3, label: "Maret" },
  { value: 4, label: "April" },
  { value: 5, label: "Mei" },
  { value: 6, label: "Juni" },
  { value: 7, label: "Juli" },
  { value: 8, label: "Agustus" },
  { value: 9, label: "September" },
  { value: 10, label: "Oktober" },
  { value: 11, label: "November" },
  { value: 12, label: "Desember" },
];

interface FilterMonthProps {
  month: number | null;
  setMonth: (month: number | null) => void;
}

function FilterMonth({ month, setMonth }: FilterMonthProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<number | null>(month);

  useEffect(() => {
    if (month) {
      setValue(month);
    }
  }, [month]);

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
            ? months.find((month) => month.value === value)?.label
            : "Filter Bulan"}
          <ChevronDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command>
          <CommandList>
            <CommandGroup>
              {months.map((month) => (
                <CommandItem
                  key={month.value}
                  value={month.value.toString()}
                  onSelect={(currentValue) => {
                    setValue(
                      currentValue === value?.toString()
                        ? null
                        : Number(currentValue),
                    );
                    setMonth(
                      currentValue === value?.toString()
                        ? null
                        : Number(currentValue),
                    );
                    setOpen(false);
                  }}
                >
                  {month.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === month.value ? "opacity-100" : "opacity-0",
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

export default FilterMonth;
