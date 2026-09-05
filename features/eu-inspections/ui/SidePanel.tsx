import { Dispatch, SetStateAction, useState } from "react";

import { rejectWith } from "@/lib/toast";

import { User, Notify } from "@components/icons";
import { EditableEntityRow } from "@/components/organisms/EditableEntityRow";
import { Eyebrow } from "@/components/atoms";

import { updateMaintenanceResponsible } from "@/features/server-actions";
import { NotificationList } from "@/features/notifications/ui/NotificationList";
import { Field } from "@/features/eu-inspections";

import type { Employee, NotificationStatus } from "@/types";

import { getEuInspection } from "../server-actions/queries";
import { EuInspectionSummary } from "./EuInspectionSummary";

import type { EuInspectionRow } from "../types";

type Props = {
  activeItem: EuInspectionRow;
  employees: Employee[];
  statusBySubjectId: Map<string, NotificationStatus>;
  setEuInspections: Dispatch<SetStateAction<EuInspectionRow[]>>;
  sendNotification: (euInspectionIds: string[]) => Promise<void>;
};

export function SidePanel({
  activeItem,
  employees,
  statusBySubjectId,
  setEuInspections,
  sendNotification,
}: Props) {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="h-dvh flex flex-col gap-3 p-4">
      <div className="flex-1 flex flex-col gap-3 overflow-y-scroll scrollbar-hide">
        <EuInspectionSummary item={activeItem} />

        <div className="flex flex-col gap-2">
          <Eyebrow>Maintenance responsible</Eyebrow>

          <div className="raised-outline-panel p-2">
            {activeItem.vehicle.employee ? (
              <EditableEntityRow
                id={activeItem.vehicle.employee.id}
                label={activeItem.vehicle.employee.name}
                icon={<User size={20} strokeWidth={1} />}
                select={{
                  getLabel: (emp) => emp.name,
                  getKey: (emp) => emp.id,
                  options: employees,
                  selected: activeItem.vehicle.employee,
                }}
                isLoading={isLoading}
                onConfirm={async (emp) => {
                  setIsLoading(true);

                  const updateResult = await updateMaintenanceResponsible(
                    activeItem.vehicle.id,
                    emp.id,
                  );
                  if (!updateResult.ok) {
                    rejectWith(updateResult.error);
                    setIsLoading(false);
                    return;
                  }

                  const inspectionResult = await getEuInspection(activeItem.id);
                  if (!inspectionResult.ok) {
                    rejectWith(inspectionResult.error);
                    setIsLoading(false);
                    return;
                  }

                  setEuInspections((prev) =>
                    prev.map((item) =>
                      item.id === activeItem.id ? inspectionResult.data : item,
                    ),
                  );
                  setIsLoading(false);
                }}
              />
            ) : (
              <div>Issues reading maintenance responsible.</div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Eyebrow>Notifications</Eyebrow>

          <div className="raised-outline-panel">
            <dl className="grid grid-cols-3 gap-4 border-b border-extra-faint">
              {(
                [
                  { label: "Total", status: undefined },
                  { label: "Sent", status: "sent" },
                  { label: "Failed", status: "failed" },
                ] as const
              ).map(({ label, status }) => (
                <Field key={label} label={label} className="py-1 px-3">
                  {status === undefined
                    ? activeItem.notifications.length
                    : activeItem.notifications.filter(
                        (n) => n.status === status,
                      ).length}
                </Field>
              ))}
            </dl>
            <NotificationList
              notifications={activeItem.notifications}
              initialCount={3}
            />
          </div>
        </div>
      </div>

      <button
        onClick={() => sendNotification([activeItem.id])}
        className="btn btn-secondary mt-auto inline-flex items-center gap-2"
        disabled={
          !activeItem.vehicle.employee ||
          statusBySubjectId.get(activeItem.id) === "queued"
        }
      >
        <Notify size={14} />
        Notify {activeItem.vehicle.employee?.name}
      </button>
    </div>
  );
}
