type Props = {
  date?: Date | string;
  // no room for a full badge on this component — a tiny corner dot is the
  // only indicator that fits
  status?: "success" | "warning" | "danger";
};

const dotColor = {
  // no shadow rn just leaving it maybe relevant later
  success: "bg-success shadow-[0_0_0px_var(--success)]",
  warning: "bg-warning shadow-[0_0_0px_var(--warning)]",
  danger: "bg-failure shadow-[0_0_0px_var(--failure)]",
};

export function DateStamp({ date, status }: Props) {
  if (!date) return null;

  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return null;

  const day = d.toLocaleDateString("nb-NO", { day: "numeric" });

  const month = d
    .toLocaleDateString("nb-NO", { month: "short" })
    .replace(".", "");

  const year = d.getFullYear();

  return (
    <div className="relative flex h-16 w-16 flex-col items-center justify-center rounded border border-extra-faint bg-ground/60">
      {status && (
        <span
          className={`absolute top-1.5 left-1.5 h-1.5 w-1.5 rounded-full ${dotColor[status]}`}
        />
      )}
      <span className="text-[10px] font-semibold uppercase tracking-wider text-accent">
        {month}
      </span>
      <span className="text-xl font-bold leading-none text-fg">{day}</span>
      <span className="text-[10px] text-muted">{year}</span>
    </div>
  );
}
