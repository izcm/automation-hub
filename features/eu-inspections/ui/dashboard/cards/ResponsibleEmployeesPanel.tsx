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
  return (
    <>
      <PanelHeader
        heading="Responsible employees"
        subtitle="Inspections grouped by responsible employee."
      />

      <ResponsibleEmployeesTable
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
