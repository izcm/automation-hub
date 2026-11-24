import { useId } from "react";

import { PanelHeader } from "@/components/molecules";
import {
  ResponsibleEmployeesTable,
  type EmployeeInspectionRow,
} from "../tables/ResponsibleEmployeesTable";

type Props = {
  rows: EmployeeInspectionRow[];
  filteredRows: EmployeeInspectionRow[];
  selectedIds: string[];
  othersPartiallySelected: boolean;
  othersSelectedCount: number;
  onRowClick: (id: string) => void;
};

export function ResponsibleEmployeesPanel({
  rows,
  filteredRows,
  selectedIds,
  othersPartiallySelected,
  othersSelectedCount,
  onRowClick,
}: Props) {
  const headingId = useId();

  return (
    <>
      <PanelHeader
        headingId={headingId}
        heading="Responsible employees"
        subtitle="Inspections grouped by responsible employee."
      />

      <ResponsibleEmployeesTable
        aria-labelledby={headingId}
        rows={rows}
        filteredRows={filteredRows}
        selectedIds={selectedIds}
        othersPartiallySelected={othersPartiallySelected}
        othersSelectedCount={othersSelectedCount}
        onRowClick={onRowClick}
      />
    </>
  );
}
