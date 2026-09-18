import { GoTo } from "@/components/icons";
import { PanelHeader } from "@/components/molecules";
import { EuInspectionsTable } from "../tables/EuInspectionsTable";
import type { EuInspectionRow } from "../../../types";

type Props = {
  items: EuInspectionRow[];
  onViewList: () => void;
};

export function InspectionRecordsPanel({ items, onViewList }: Props) {
  const visible = items.slice(0, 4);

  return (
    <>
      <PanelHeader
        heading="Inspection records"
        subtitle="Records matching dashboard filters, ordered by due date."
        action={
          <button
            type="button"
            className="flex btn justify-between text-sm text-accent hover:text-accent-strong h-4"
            onClick={onViewList}
          >
            See in list view
            <span aria-hidden="true">
              <GoTo size={14} />
            </span>
          </button>
        }
      />

      <EuInspectionsTable rows={visible} remaining={items.length - visible.length} />
    </>
  );
}
