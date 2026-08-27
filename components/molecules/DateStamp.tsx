type Props = {
  date?: string;
};

// Small calendar-style stamp, e.g. "SEP / 1 / 2026" — Norwegian month names.
export function DateStamp({ date }: Props) {
  if (!date) return null;

  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;

  const day = d.toLocaleDateString("nb-NO", { day: "numeric" });
  const month = d
    .toLocaleDateString("nb-NO", { month: "short" })
    .replace(".", "");
  const year = d.getFullYear();

  return (
    <div className="flex h-16 w-16 flex-col items-center justify-center rounded-lg border border-extra-faint bg-ground/30">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-accent">
        {month}
      </span>
      <span className="text-xl font-bold leading-none text-fg">{day}</span>
      <span className="text-[10px] text-muted">{year}</span>
    </div>
  );
}
