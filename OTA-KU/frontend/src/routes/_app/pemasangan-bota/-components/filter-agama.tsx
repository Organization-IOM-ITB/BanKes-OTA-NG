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
import { useState, useEffect } from "react";

const agamaList = [
  "Islam",
  "Kristen Protestan",
  "Katolik",
  "Hindu",
  "Buddha",
  "Konghucu",
];

function FilterAgama({ setAgama }: { setAgama: (agama: string | null) => void }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  useEffect(() => {
    const handleReset = () => {
      setValue("");
      setAgama(null);
    };

    document.addEventListener("resetFilters", handleReset);
    return () => document.removeEventListener("resetFilters", handleReset);
  }, [setAgama]);

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
          {value || "Filter Agama"}
          <ChevronDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command>
          <CommandList>
            <CommandGroup>
              {agamaList.map((agama) => (
                <CommandItem
                  key={agama}
                  value={agama}
                  onSelect={(currentValue) => {
                    const newValue = currentValue === value ? "" : currentValue;
                    setValue(newValue);
                    setAgama(newValue || null);
                    setOpen(false);
                  }}
                >
                  {agama}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === agama ? "opacity-100" : "opacity-0",
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

export default FilterAgama;
