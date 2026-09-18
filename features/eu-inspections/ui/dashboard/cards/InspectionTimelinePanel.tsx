import { PanelHeader } from "@/components/molecules";
import { InteractiveBarChart } from "@/components/analytics/InteractiveBarChart";

import {
  STATUS_COLOR,
  STATUS_INFO,
  STATUS_LABELS,
  type Status,
} from "../../../logic/status";
import type { aggregateByTimeBucket } from "../../../logic/dashboard-aggregates";

type TimeBucketRow = ReturnType<typeof aggregateByTimeBucket>[number];

type Props = {
  rows: TimeBucketRow[];
  filteredRows: TimeBucketRow[];
  selectedStatuses: Status[];
  selectedTimeBuckets: string[];
  onCategoryClick: (bucket: string) => void;
  onLegendClick: (status: string) => void;
};

export function InspectionTimelinePanel({
  rows,
  filteredRows,
  selectedStatuses,
  selectedTimeBuckets,
  onCategoryClick,
  onLegendClick,
}: Props) {
  return (
    <>
      <PanelHeader
        heading="Inspection timeline"
        subtitle="Inspections grouped by time bucket and status."
      />

      <div className="flex flex-col lg:flex-row lg:gap-3 h-64 lg:h-80">
        <InteractiveBarChart
          rows={rows}
          filteredRows={filteredRows}
          dataKey="timeBucket"
          series={(Object.keys(STATUS_INFO) as Status[])
            .filter((status) => status !== "unexpectedCase")
            .map((key) => ({
              key,
              label: STATUS_LABELS[key],
              color: STATUS_COLOR[key],
              sort: STATUS_INFO[key].sort,
            }))}
          selectedSeriesKeys={selectedStatuses}
          selectedCategories={selectedTimeBuckets}
          onCategoryClick={onCategoryClick}
          onLegendClick={onLegendClick}
        />
      </div>
    </>
  );
}
