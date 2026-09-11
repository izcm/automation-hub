import { Cancel } from "@/components/icons";
import { cn } from "@/lib/cn";

// one chip per active filter — deliberately generic (id/label/values), not
// tied to any feature's own filter representation (predicate functions,
// URL params, etc). Callers map their own shape into this before rendering.
export type FilterChip = {
  id: string;
  label: string;
  values: string[];
};

type Props = {
  filters: FilterChip[];
  onRemove: (id: string) => void;
  className?: string;
};

export function FilterChips({ filters, onRemove, className }: Props) {
  if (filters.length === 0) return null;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {filters.map((filter) => (
        <div
          key={filter.id}
          className="flex items-center gap-1.5 rounded-full bg-elevated px-3 py-1 text-xs"
        >
          <span className="font-medium">{filter.label}:</span>
          <span className="text-subtle">{filter.values.join(", ")}</span>
          <button
            type="button"
            onClick={() => onRemove(filter.id)}
            className="text-subtle hover:text-fg"
          >
            <Cancel size={12} />
          </button>
        </div>
      ))}
    </div>
  );
}
