import { ReactNode } from "react";

import { cn } from "@/lib/cn";
import { Next, Prev } from "@components/icons";

type Props = {
  page: number;
  pageCount: number;
  total: number;
  pageSize: number;
  onChange: (page: number) => void;
  // "Showing 1–25 of 100" — injected so the generic component stays language-agnostic
  label?: (from: number, to: number, total: number) => ReactNode;
};

const step =
  "flex-center h-9 min-w-9 rounded-lg border border-faint px-2 hover:border-accent disabled:opacity-40 disabled:hover:border-faint";

export function Pagination({
  page,
  pageCount,
  total,
  pageSize,
  onChange,
  label = (from, to, total) => `Showing ${from}–${to} of ${total}`,
}: Props) {
  if (total === 0) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);

  return (
    <div className="flex-center flex-col justify-center gap-6 py-2 text-sm">
      <div className="flex-center gap-2">
        <button
          className={step}
          disabled={page === 1}
          onClick={() => onChange(page - 1)}
          aria-label="Previous page"
        >
          <Prev size={16} />
        </button>

        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onChange(p)}
            aria-current={p === page ? "page" : undefined}
            className={cn(step, p === page && "border-accent text-accent")}
          >
            {p}
          </button>
        ))}

        <button
          className={step}
          disabled={page === pageCount}
          onClick={() => onChange(page + 1)}
          aria-label="Next page"
        >
          <Next size={16} />
        </button>
      </div>

      <span className="text-subtle">{label(from, to, total)}</span>
    </div>
  );
}
