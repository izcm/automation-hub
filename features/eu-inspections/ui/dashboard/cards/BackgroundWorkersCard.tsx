import { PanelHeader } from "@/components/molecules";

// static preview rows — real data/config lands once background workers ship
const WORKERS = [
  {
    name: "Notify assignment contact 1 week before workshop booking",
    lastPinged: "2 min ago",
  },
  {
    name: "Ping depot manager when an inspection is rejected twice",
    lastPinged: "38 min ago",
  },
  {
    name: "Sync vehicle registry with EU inspection due dates nightly",
    lastPinged: "6 hours ago",
  },
];

export function BackgroundWorkersCard() {
  return (
    <>
      <PanelHeader
        heading="Background workers"
        subtitle="Preview — configuration coming soon."
      />

      <ul className="flex flex-col divide-y divide-extra-faint">
        {WORKERS.map((worker) => (
          <li
            key={worker.name}
            className="flex items-center justify-between gap-3 py-2"
          >
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-sm truncate">{worker.name}</span>
              <span className="text-xs text-subtle inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-safe shadow-[0_0_3px_var(--safe)] animate-pulse" />
                Last pinged {worker.lastPinged}
              </span>
            </div>

            <button
              type="button"
              disabled
              className="btn btn-secondary px-3 text-sm shrink-0"
            >
              Configure
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
