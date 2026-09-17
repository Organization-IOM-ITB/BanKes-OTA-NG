import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Jurusan } from "@/lib/nim";
import { cn } from "@/lib/utils";
import { Check, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

import { majors } from "./constant";

interface FilterJurusanProps {
  jurusan: Jurusan | null;
  setJurusan: (jurusan: Jurusan | null) => void;
}

function FilterJurusan({ jurusan, setJurusan }: FilterJurusanProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  useEffect(() => {
    if (jurusan) {
      setValue(jurusan);
    }
  }, [jurusan]);

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
            ? majors.find((major) => major.value === value)?.label
            : "Filter Jurusan"}
          <ChevronDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command>
          <CommandInput placeholder="Cari jurusan..." />
          <CommandList>
            <CommandEmpty>Jurusan tidak ditemukan</CommandEmpty>
            <CommandGroup>
              {majors.map((major) => (
                <CommandItem
                  key={major.value}
                  value={major.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue);
                    setJurusan(
                      currentValue === value ? null : (currentValue as Jurusan),
                    );
                    setOpen(false);
                  }}
                >
                  {major.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === major.value ? "opacity-100" : "opacity-0",
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

export default FilterJurusan;
