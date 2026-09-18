import { PanelHeader } from "@/components/molecules";
import { AssignmentsTable } from "../tables/AssignmentsTable";
import type { AssignmentInspectionRow } from "../../../logic/dashboard-aggregates";

type Props = {
  rows: AssignmentInspectionRow[];
  filteredRows: AssignmentInspectionRow[];
  selectedIds: string[];
  othersPartiallySelected: boolean;
  othersSelectedCount: number;
  relevantColumns: string[];
  onRowClick: (id: string) => void;
};

export function AssignmentsPanel({
  rows,
  filteredRows,
  selectedIds,
  othersPartiallySelected,
  othersSelectedCount,
  relevantColumns,
  onRowClick,
}: Props) {
  return (
    <>
      <PanelHeader
        heading="Assignments"
        subtitle="Inspections grouped by vehicle assignment."
      />

      <div className="lg:h-80">
        <AssignmentsTable
          rows={rows}
          filteredRows={filteredRows}
          selectedIds={selectedIds}
          othersPartiallySelected={othersPartiallySelected}
          othersSelectedCount={othersSelectedCount}
          relevantColumns={relevantColumns}
          onRowClick={onRowClick}
        />
      </div>
    </>
  );
}
