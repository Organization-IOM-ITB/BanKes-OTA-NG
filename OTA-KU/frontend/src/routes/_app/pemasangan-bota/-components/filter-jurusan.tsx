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
import { Jurusan } from "@/lib/nim";
import { cn } from "@/lib/utils";
import { Check, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

const jurusanList = [
  "Matematika",
  "Fisika",
  "Astronomi",
  "Mikrobiologi",
  "Kimia",
  "Biologi",
  "Sains dan Teknologi Farmasi",
  "Aktuaria",
  "Rekayasa Hayati",
  "Rekayasa Pertanian",
  "Rekayasa Kehutanan",
  "Farmasi Klinik dan Komunitas",
  "Teknologi Pasca Panen",
  "Teknik Geologi",
  "Teknik Pertambangan",
  "Teknik Perminyakan",
  "Teknik Geofisika",
  "Teknik Metalurgi",
  "Meteorologi",
  "Oseanografi",
  "Teknik Kimia",
  "Teknik Mesin",
  "Teknik Elektro",
  "Teknik Fisika",
  "Teknik Industri",
  "Teknik Informatika",
  "Aeronotika dan Astronotika",
  "Teknik Material",
  "Teknik Pangan",
  "Manajemen Rekayasa Industri",
  "Teknik Bioenergi dan Kemurgi",
  "Teknik Sipil",
  "Teknik Geodesi dan Geomatika",
  "Arsitektur",
  "Teknik Lingkungan",
  "Perencanaan Wilayah dan Kota",
  "Teknik Kelautan",
  "Rekayasa Infrastruktur Lingkungan",
  "Teknik dan Pengelolaan Sumber Daya Air",
  "Seni Rupa",
  "Desain",
  "Kriya",
  "Desain Interior",
  "Desain Komunikasi Visual",
  "Desain Produk",
  "Teknik Tenaga Listrik",
  "Teknik Telekomunikasi",
  "Sistem Teknologi dan Informasi",
  "Teknik Biomedis",
  "Manajemen",
  "Kewirausahaan",
  "TPB",
];

function FilterJurusan({
  setJurusan,
}: {
  setJurusan: (jurusan: Jurusan | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  useEffect(() => {
    const handleReset = () => {
      setValue("");
      setJurusan(null);
    };

    document.addEventListener("resetFilters", handleReset);
    return () => document.removeEventListener("resetFilters", handleReset);
  }, [setJurusan]);

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
          {value || "Filter Jurusan"}
          <ChevronDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command>
          <CommandList>
            <CommandGroup>
              {jurusanList.map((jurusan) => (
                <CommandItem
                  key={jurusan}
                  value={jurusan}
                  onSelect={(currentValue) => {
                    const newValue = currentValue === value ? "" : currentValue;
                    setValue(newValue);
                    setJurusan((newValue as Jurusan) || null);
                    setOpen(false);
                  }}
                >
                  {jurusan}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === jurusan ? "opacity-100" : "opacity-0",
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
