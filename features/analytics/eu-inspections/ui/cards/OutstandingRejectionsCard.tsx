import { cn } from "@/lib/cn";
import { Calendar } from "@/components/icons";
import type { EuInspectionRow } from "../../types";
import { getInspectionStatus } from "../../logic";

type Props = {
  inspectionRows: EuInspectionRow[];
  relevant: boolean;
};

// relevant -> the data actually means something
// !relevant -> showing data is confusing because of filters set
export function OutstandingRejectionsCard({ inspectionRows, relevant }: Props) {
  const today = new Date();
  const in8Weeks = new Date(today);
  in8Weeks.setDate(today.getDate() + 56);

  const rejected = inspectionRows.filter(
    (row) => getInspectionStatus(row) === "rejectedUnbooked",
  );

  const dueInPeriod = rejected.filter((row) => {
    const dueDate = new Date(row.dueDate);
    return dueDate >= today && dueDate <= in8Weeks;
  });

  return (
    <div className="flex items-center p-3 gap-3">
      <div className="flex-1 flex flex-col gap-1">
        <span
          className={cn(
            "text-5xl font-semibold",
            rejected.length === 0 || !relevant ? "text-subtle" : "text-failure",
          )}
        >
          {relevant ? rejected.length : "–"}
        </span>
        <p className="text-sm font-medium">Across all due dates</p>
        <p className="text-xs text-subtle">
          Includes past, current and future due dates.
        </p>
      </div>

      <div className="vertical-line" />

      <div className="flex-1 flex flex-col gap-1">
        <span
          className={cn(
            "inline-flex items-baseline gap-2 text-3xl font-semibold",
            dueInPeriod.length === 0 && "text-subtle",
          )}
        >
          {relevant ? (
            <>
              <Calendar size={20} className="text-subtle" />
              {dueInPeriod.length}
            </>
          ) : (
            "–"
          )}
        </span>
        <p className="text-sm font-medium">Within dashboard selection</p>
        <p className="text-xs text-subtle"></p>
      </div>
    </div>
  );
}
