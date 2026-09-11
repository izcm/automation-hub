type Props = {
  date?: Date | string;
  // no room for a full badge on this component — a tiny corner dot is the
  // only indicator that fits
  status?: "pending" | "advisory" | "caution" | "critical";
};

const dotColor = {
  // no shadow rn just leaving it maybe relevant later
  // neutral: "bg-neutral shadow-[0_0_4px_var(--neutral)]",
  pending: "bg-pending shadow-[0_0_3px_var(--pending)]",
  advisory: "bg-advisory shadow-[0_0_3px_var(--advisory)]",
  caution: "bg-caution shadow-[0_0_3px_var(--caution)]",
  critical: "bg-critical shadow-[0_0_3px_var(--critical)]",
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
          className={`absolute top-[3] left-[3] h-1.5 w-1.5 rounded-full ${dotColor[status]}`}
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
