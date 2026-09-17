import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import type * as React from "react";

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  setSearch?: (search: string) => void;
  placeholder?: string;
}

export function SearchInput({
  setSearch,
  placeholder,
  className,
  ...props
}: SearchInputProps) {
  return (
    <div className="relative">
      <Search className="text-muted-foreground absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2" />
      <Input
        type="search"
        className={cn("border border-placeholder pl-9", className)}
        placeholder={placeholder ?? "Search..."}
        onChange={(e) => {
          if (setSearch) {
            setSearch(e.target.value);
          }
        }}
        {...props}
      />
    </div>
  );
}
