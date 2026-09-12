import type { EuInspectionRow } from "../../types";

import { countFieldValues } from "../../../logic/count";
import {
  getInspectionStatus,
  STATUS_COLOR,
  STATUS_LABELS,
  type Status,
} from "../../logic";
import { KPI, zeroSafeColor, type KPIProps } from "../../../ui/KPI";
import { SmartKPIs } from "../../../ui/SmartKPIs";

type Props = {
  rows: EuInspectionRow[];
  selectedStatuses: string[];
};

// the tiles that share a shape: status-driven count, color falls back to
// "empty" at zero. "Due in period" and "Approved" don't fit this (one
// isn't status-based, the other never zero-safes), so they stay explicit.
const KPIS: { key: Status; label?: string; descr: string }[] = [
  {
    key: "approved",
    descr: "EU inspections due in the next 30 days",
  },
  {
    key: "upcoming",
    label: "Upcoming first workshop",
    descr: "No earlier attempt, and has an upcoming booking.",
  },
  {
    key: "rejectedBooked",
    descr: "Rejected, but a new workshop is already booked.",
  },
  {
    key: "rejectedUnbooked",
    descr: "Rejected, and nothing new is booked yet.",
  },
  {
    key: "unresolved",
    descr: "No attempts, no booking. Just closing due.",
  },
];

// turns the ZERO_SAFE_KPIS registry into the (KPIProps & {key})[] shape
// SmarterKPIs wants, resolving each entry's value/color against live counts.
function toKpiProps(
  counts: ReturnType<typeof countFieldValues<{ state: string }, "state">>,
): (KPIProps & { key: string })[] {
  return KPIS.map(({ key: status, label, descr }) => ({
    key: status,
    title: label ?? STATUS_LABELS[status],
    value: counts[status],
    color: zeroSafeColor(counts[status], STATUS_COLOR[status]),
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
      {}
      <KPI
        title="Due in period"
        value={rows.length}
        color="neutral"
        descr="EU inspections due in the next 30 days"
      />

      <SmartKPIs
        kpis={toKpiProps(inspectionStateCounts)}
        relevantKeys={relevantStatuses}
      />
    </>
  );
}
