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
import { Fakultas } from "@/lib/nim";
import { cn } from "@/lib/utils";
import { Check, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

const fakultasList = [
  "FMIPA",
  "SITH-S",
  "SF",
  "FITB",
  "FTTM",
  "STEI-R",
  "FTSL",
  "FTI",
  "FSRD",
  "FTMD",
  "STEI-K",
  "SBM",
  "SITH-R",
  "SAPPK",
];

function FilterFakultas({
  setFakultas,
}: {
  setFakultas: (fakultas: Fakultas | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  useEffect(() => {
    const handleReset = () => {
      setValue("");
      setFakultas(null);
    };

    document.addEventListener("resetFilters", handleReset);
    return () => document.removeEventListener("resetFilters", handleReset);
  }, [setFakultas]);

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
          {value || "Filter Fakultas"}
          <ChevronDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command>
          <CommandList>
            <CommandGroup>
              {fakultasList.map((fakultas) => (
                <CommandItem
                  key={fakultas}
                  value={fakultas}
                  onSelect={(currentValue) => {
                    const newValue = currentValue === value ? "" : currentValue;
                    setValue(newValue);
                    setFakultas((newValue as Fakultas) || null);
                    setOpen(false);
                  }}
                >
                  {fakultas}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === fakultas ? "opacity-100" : "opacity-0",
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

export default FilterFakultas;
