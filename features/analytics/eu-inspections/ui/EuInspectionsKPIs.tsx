import { Calendar } from "@/components/icons";
import type { EuInspectionRow } from "@/features/eu-inspections";
import { countFieldValues } from "../../logic/count";

import {
  getInspectionStatus,
  STATUS_COLOR,
  STATUS_LABELS,
  type StatusColor,
} from "../logic";
import { KPI, type KPIProps } from "../../ui/KPI";

// zero of a real problem (advisory/caution/critical) is a good outcome —
// don't let it look alarming. "empty", not "neutral": neutral is itself a
// real category's color (Approved's), so reusing it here would make a
// zero-count tile look like it belongs to that category instead of just
// having nothing to report.
function zeroSafeColor(
  count: number | undefined,
  color: StatusColor,
): NonNullable<KPIProps["color"]> {
  return (count ?? 0) === 0 ? "empty" : color;
}

type Props = {
  rows: EuInspectionRow[];
};

export function EuInspectionsKPIs({ rows }: Props) {
  const inspectionStateCounts = countFieldValues(
    rows.map((item) => ({ state: getInspectionStatus(item) })),
    "state",
  );

  return (
    <>
      <KPI
        label="Due in period"
        value={rows.length}
        color="neutral"
        descr="EU inspections due in the next 30 days"
      />
      <KPI
        label={STATUS_LABELS.approved}
        value={inspectionStateCounts.approved}
        color={STATUS_COLOR.approved}
        descr="Latest attempt was approved."
      />

      <KPI
        label="Upcoming first workshop"
        value={inspectionStateCounts.upcoming}
        color={zeroSafeColor(
          inspectionStateCounts.upcoming,
          STATUS_COLOR.upcoming,
        )}
        descr="No earlier attempt, and has an upcoming booking."
      />
      <KPI
        label={STATUS_LABELS.rejectedBooked}
        value={inspectionStateCounts.rejectedBooked}
        color={zeroSafeColor(
          inspectionStateCounts.rejectedBooked,
          STATUS_COLOR.rejectedBooked,
        )}
        descr="Rejected, but a new workshop is already booked."
      />
      <KPI
        label={STATUS_LABELS.rejectedUnbooked}
        value={inspectionStateCounts.rejectedUnbooked}
        color={zeroSafeColor(
          inspectionStateCounts.rejectedUnbooked,
          STATUS_COLOR.rejectedUnbooked,
        )}
        descr="Rejected, and nothing new is booked yet."
      />
      <KPI
        label={STATUS_LABELS.unresolved}
        value={inspectionStateCounts.unresolved}
        color={zeroSafeColor(
          inspectionStateCounts.unresolved,
          STATUS_COLOR.unresolved,
        )}
        descr="No attempts, no booking. Just closing due."
      />
    </>
  );
}
