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

const kelaminList = [
  { value: "M", label: "Laki-laki" },
  { value: "F", label: "Perempuan" },
];

function FilterKelamin({ setKelamin }: { setKelamin: (kelamin: "M" | "F" | null) => void }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string | null>(null);

  useEffect(() => {
    const handleReset = () => {
      setValue(null);
      setKelamin(null);
    };

    document.addEventListener("resetFilters", handleReset);
    return () => document.removeEventListener("resetFilters", handleReset);
  }, [setKelamin]);

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
          {value || "Filter Kelamin"}
          <ChevronDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command>
          <CommandList>
            <CommandGroup>
              {kelaminList.map((kelamin) => (
                <CommandItem
                  key={kelamin.value}
                  value={kelamin.value}
                  onSelect={(currentValue) => {
                    if (value === kelamin.label) {
                      // Unselect if the same item is clicked
                      setValue(null);
                      setKelamin(null);
                    } else {
                      const selectedKelamin = kelaminList.find(
                        (k) => k.value === currentValue
                      );
                      const newValue = selectedKelamin?.label || "";
                      setValue(newValue);
                      setKelamin(selectedKelamin?.value as "M" | "F" | null);
                    }
                    setOpen(false);
                  }}
                >
                  {kelamin.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === kelamin.label ? "opacity-100" : "opacity-0",
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

export default FilterKelamin;
