import { ReactNode } from "react";

import { Inspection, Info } from "@/components/icons";
import type { EuInspectionRow } from "../../types";

import { countFieldValues } from "../../../logic/count";
import {
  getInspectionStatus,
  STATUS_COLOR,
  STATUS_ICON,
  STATUS_INFO,
  STATUS_LABELS,
  type Status,
} from "../../logic";
import { KPI, zeroSafeColor, type KPIProps } from "../../../ui/KPI";
import { SmartKPIs } from "../../../ui/SmartKPIs";

type Props = {
  rows: EuInspectionRow[];
  selectedStatuses: string[];
};

// title + an info icon that reveals `info` on hover or press (tap focuses
// the button, which is enough — no JS state needed). descr on the KPI
// itself still always shows; this is additional, opt-in detail.
function KPITitle({
  children,
  info,
}: {
  children: ReactNode;
  info: ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      {children}
      <span className="group relative inline-flex">
        <button
          type="button"
          className="text-subtle outline-none hover:text-fg focus:text-fg"
          aria-label="More info"
        >
          <Info size={14} />
        </button>
        <span
          role="tooltip"
          className="
            pointer-events-none absolute top-full left-0 z-10 mt-1 w-56
            invisible rounded border border-faint bg-raised p-2 text-xs
            font-normal text-fg opacity-0 shadow-lg transition-opacity
            group-hover:visible group-hover:opacity-100
            group-focus-within:visible group-focus-within:opacity-100
          "
        >
          {info}
        </span>
      </span>
    </span>
  );
}

// the tiles that share a shape: status-driven count, color falls back to
// "empty" at zero. "Due in period" and "Approved" don't fit this (one
// isn't status-based, the other never zero-safes), so they stay explicit.
const UNSORTED_KPIS: {
  key: Status;
  label?: string;
  descr: string;
  info: string;
}[] = [
  {
    key: "approved",
    descr: "Latest attempt was approved.",
    info: "Example: inspection passed at the workshop on its most recent attempt — nothing more to do.",
  },
  {
    key: "firstAttempt",
    descr: "No earlier attempt, and has an upcoming booking.",
    info: "Example: due in 3 weeks, workshop already booked, no prior attempts yet.",
  },
  {
    key: "rejectedBooked",
    descr: "Rejected, but a new workshop is already booked.",
    info: "Example: failed inspection last week, already rebooked for next Tuesday.",
  },
  {
    key: "rejectedUnbooked",
    descr: "Rejected, and nothing new is booked yet.",
    info: "Example: failed inspection two weeks ago, no new appointment scheduled — needs action.",
  },
  {
    key: "unresolved",
    descr: "No attempts, no booking. Just closing due.",
    info: "Example: due date is approaching, no inspection attempted and nothing booked yet.",
  },
];

const KPIS = [...UNSORTED_KPIS].sort(
  (a, b) => STATUS_INFO[a.key].sort - STATUS_INFO[b.key].sort,
);

// turns the ZERO_SAFE_KPIS registry into the (KPIProps & {key})[] shape
// SmarterKPIs wants, resolving each entry's value/color against live counts.
function toKpiProps(
  counts: ReturnType<typeof countFieldValues<{ state: string }, "state">>,
): (KPIProps & { key: string })[] {
  return KPIS.map(({ key: status, label, descr, info }) => ({
    key: status,
    title: <KPITitle info={info}>{label ?? STATUS_LABELS[status]}</KPITitle>,
    value: counts[status],
    color: zeroSafeColor(counts[status], STATUS_COLOR[status]),
    icon: STATUS_ICON[status],
    descr,
  }));
}

export function EuInspectionsKPIs({ rows, selectedStatuses }: Props) {
  const inspectionStateCounts = countFieldValues(
    rows.map((item) => ({ state: getInspectionStatus(item) })),
    "state",
  );

  const relevantStatuses =
    selectedStatuses.length > 0 ? [...selectedStatuses, "due"] : [];

  return (
    <>
      <KPI
        title={
          <KPITitle info="Example: a vehicle's EU inspection is due in 40 days — counted here regardless of status.">
            Due
          </KPITitle>
        }
        value={rows.length}
        color="neutral"
        icon={Inspection}
        descr="EU inspections due the next 8 weeks."
      />

      <SmartKPIs
        kpis={toKpiProps(inspectionStateCounts)}
        relevantKeys={relevantStatuses}
      />
    </>
  );
}
