type Props = {
  date?: Date | string;
};

export function DateStamp({ date }: Props) {
  if (!date) return null;

  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return null;

  const day = d.toLocaleDateString("nb-NO", { day: "numeric" });

  const month = d
    .toLocaleDateString("nb-NO", { month: "short" })
    .replace(".", "");

  const year = d.getFullYear();

  return (
    <div className="flex h-16 w-16 flex-col items-center justify-center rounded border border-extra-faint bg-ground/60">
      <span className="text-[10px] font-semibold uppercase tracking-lg text-accent">
        {month}
      </span>
      <span className="text-xl font-bold leading-none text-fg">{day}</span>
      <span className="text-[10px] text-muted">{year}</span>
    </div>
  );
}
