import { PanelHeader } from "@/components/molecules";
import {
  Legend,
  InteractiveBarChart,
} from "@/components/analytics/InteractiveBarChart";

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
  const series = (Object.keys(STATUS_INFO) as Status[])
    .filter((status) => status !== "unexpectedCase")
    .map((key) => ({
      key,
      label: STATUS_LABELS[key],
      color: STATUS_COLOR[key],
      sort: STATUS_INFO[key].sort,
    }));

  return (
    <>
      <PanelHeader
        heading="Inspection timeline"
        subtitle="Inspections grouped by time bucket and status."
      />

      <InteractiveBarChart
        rows={rows}
        filteredRows={filteredRows}
        dataKey="timeBucket"
        series={series}
        selectedSeriesKeys={selectedStatuses}
        selectedCategories={selectedTimeBuckets}
        onCategoryClick={onCategoryClick}
        legend={({ series, relevantKeys }) => (
          <ul
            className="
                flex justify-around gap-2
              "
          >
            {series.map((serie) => (
              <li key={serie.key} className="flex-auto">
                <Legend
                  serie={serie}
                  relevantKeys={relevantKeys}
                  hasSelection={relevantKeys.length < series.length}
                  onClick={onLegendClick}
                />
              </li>
            ))}
          </ul>
        )}
      />
    </>
  );
}
