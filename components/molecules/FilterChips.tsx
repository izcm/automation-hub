import { Cancel, ChevronDown } from "@/components/icons";
import { cn } from "@/lib/cn";
import { capitalize } from "@a2zb/lib";

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
          className="
            flex items-center gap-1.5 
            rounded-full text-sm
            "
        >
          <span className="font-medium">{capitalize(filter.label)}:</span>

          <div className="flex items-center gap-3 bg-elevated rounded-full px-3 h-10">
            {/* <span className="text-subtle">{filter.values.join(", ")}</span> */}
            <div className="flex items-center gap-3 pl-2">
              <span>{filter.values.length} selected</span>
              <button
                type="button"
                onClick={() => onRemove(filter.id)}
                className="text-subtle hover:text-fg"
              >
                <ChevronDown size={16} />
              </button>
            </div>

            <div className="vertical-line h-1/2 bg-muted/40 self-center ml-auto" />
            <button
              type="button"
              onClick={() => onRemove(filter.id)}
              className="text-subtle hover:text-fg"
            >
              <Cancel size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
