import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface CountDataCardProps {
  title: string;
  count: number | undefined;
  color: string;
}

function CountDataCard({ title, count, color }: CountDataCardProps) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-placeholder bg-white p-4">
      <p className="text-sm font-medium text-placeholder">{title}</p>
      {count !== undefined ? (
        <p className={cn("text-[26px] font-bold", color)}>{count}</p>
      ) : (
        <Skeleton className="h-8 w-1/2" />
      )}
    </div>
  );
}

export default CountDataCard;
