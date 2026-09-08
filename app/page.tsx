import { countFieldValues } from "@/features/dashboards/logic";
import { DashboardView, Status } from "@/features/dashboards/ui/DashboardView";
import {
  EuInspectionRow,
  getEuInspections,
} from "@/features/eu-inspections/server-actions/queries";

export default async function Page() {
  const inspectionResult = await getEuInspections();

  let enriched;

  if (inspectionResult.ok) {
    // go over each EU inspection and then for its attemps:
    // sort the attempts by date (which shoud be handled in repo layer but just to it here now)
    // if the latest attempt is upcoming && item before that is failed => count fail
    enriched = inspectionResult.data.map((item) => ({
      ...item,
      state: getInspectionState(item),
      latestAttempt: item.attempts[item.attempts.length - 1]?.status,
      attemptsStatusCount: countFieldValues(item.attempts, "status"),
    }));
  }

  return <DashboardView inspectionAnalytics={enriched ?? []} />;
}

function getInspectionState(inspection: EuInspectionRow): Status {
  const attempts = [...inspection.attempts].sort((a, b) =>
    b.date.localeCompare(a.date),
  );

  const latest = attempts[0];
  const previous = attempts[1];

  if (!latest) return "unresolved";

  if (latest?.status === "approved") {
    return "approved";
  }

  if (latest?.status === "rejected") {
    return "rejected";
  }

  if (latest?.status === "upcoming" && previous?.status === "rejected") {
    return "rejected";
  }

  if (latest?.status === "upcoming" && !previous) {
    return "upcoming";
  }

  if (latest?.status === "upcoming" && previous?.status === "approved") {
    return "unexpected case";
  }

  return "upcoming";
}
