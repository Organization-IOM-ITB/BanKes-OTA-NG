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

const userTypes = [
  {
    value: "mahasiswa",
    label: "Mahasiswa",
  },
  {
    value: "ota",
    label: "Orang Tua Asuh",
  },
  {
    value: "admin",
    label: "Admin",
  },
  {
    value: "bankes",
    label: "Bantuan Kesejahteraan",
  },
  {
    value: "pengurus",
    label: "Pengurus",
  },
];

interface FilterTypeProps {
  type: "mahasiswa" | "ota" | "admin" | "bankes" | "pengurus" | null;
  setType: (
    type: "mahasiswa" | "ota" | "admin" | "bankes" | "pengurus" | null,
  ) => void;
}

function FilterType({ type, setType }: FilterTypeProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  useEffect(() => {
    if (type) {
      setValue(type);
    } else {
      setValue("");
    }
  }, [type]);

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
            ? userTypes.find((item) => item.value === value)?.label
            : "Filter Tipe Akun"}
          <ChevronDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command>
          <CommandList>
            <CommandGroup>
              {userTypes.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue);
                    setType(
                      currentValue === value
                        ? null
                        : (currentValue as
                            | "mahasiswa"
                            | "ota"
                            | "admin"
                            | "bankes"
                            | "pengurus"),
                    );
                    setOpen(false);
                  }}
                >
                  {item.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === item.value ? "opacity-100" : "opacity-0",
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

export default FilterType;
