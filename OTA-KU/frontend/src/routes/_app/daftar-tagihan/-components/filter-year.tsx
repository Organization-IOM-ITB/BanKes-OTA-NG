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

interface FilterYearProps {
  years: number[];
  year: number | null;
  setYear: (year: number | null) => void;
}

function FilterYear({ years, year, setYear }: FilterYearProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<number | null>(year);

  useEffect(() => {
    if (year) {
      setValue(year);
    }
  }, [year]);

  const yearsValueLabel = years.map((year) => ({
    value: year.toString(),
    label: year.toString(),
  }));

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
            ? yearsValueLabel.find((year) => year.value === String(value))
                ?.label
            : "Filter Tahun"}
          <ChevronDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command>
          <CommandList>
            <CommandGroup>
              {yearsValueLabel.map((year) => (
                <CommandItem
                  key={year.value}
                  value={year.value.toString()}
                  onSelect={(currentValue) => {
                    setValue(
                      currentValue === value?.toString()
                        ? null
                        : Number(currentValue),
                    );
                    setYear(
                      currentValue === value?.toString()
                        ? null
                        : Number(currentValue),
                    );
                    setOpen(false);
                  }}
                >
                  {year.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      String(value) === year.value
                        ? "opacity-100"
                        : "opacity-0",
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

export default FilterYear;
