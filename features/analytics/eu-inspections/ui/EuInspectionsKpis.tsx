import { Calendar } from "@/components/icons";
import type { EuInspectionRow } from "@/features/eu-inspections";
import { countFieldValues } from "../../logic/count";

import { getInspectionStatus, STATUS_LABELS } from "../logic";
import { KPI } from "../../ui/KPI";

function formatDateRange(from: Date, to: Date): string {
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  return `${fmt(from)} – ${fmt(to)}`;
}

type Props = {
  inspectionRows: EuInspectionRow[];
};

export function EuInspectionsKpis({ inspectionRows }: Props) {
  const today = new Date();
  const in30Days = new Date(today);
  in30Days.setDate(today.getDate() + 30);

  const inspectionStateCounts = countFieldValues(
    inspectionRows.map((item) => ({ state: getInspectionStatus(item) })),
    "state",
  );

  return (
    <>
      <h2 className="font-semibold inline-flex items-center gap-3">
        EU Inspections dues next 30 days{" "}
        <span className="text-xs text-subtle tabular-nums inline-flex gap-1">
          <Calendar size={14} />
          {formatDateRange(today, in30Days)}
        </span>
      </h2>

      <div className="grid grid-cols-3 lg:grid-cols-5 gap-3 mt-2">
        <KPI
          label="Due in period"
          value={inspectionRows.length}
          color="accent"
          descr="Eu inspections due in the next 30 days"
        />
        <KPI
          label={STATUS_LABELS.unresolved}
          value={inspectionStateCounts.unresolved}
          color="neutral"
          descr="No attempts, no booking. Just closing due."
        />
        <KPI
          label={STATUS_LABELS.approved}
          value={inspectionStateCounts.approved}
          color="success"
          descr="Latest attempt was approved."
        />
        <KPI
          label={STATUS_LABELS.rejectedBooked}
          value={inspectionStateCounts.rejectedBooked}
          color="warning"
          descr="Rejected, but a new workshop is already booked."
        />
        <KPI
          label={STATUS_LABELS.rejectedUnbooked}
          value={inspectionStateCounts.rejectedUnbooked}
          color="failure"
          descr="Rejected, and nothing new is booked yet."
        />
      </div>
    </>
  );
}
