import { Dispatch, SetStateAction, useState } from "react";

import { Notify } from "@components/icons";
import { EditableEntityRow } from "@/components/organisms/EditableEntityRow";
import { Eyebrow } from "@/components/atoms";
import { InitialsBadge } from "@/components/molecules";

import { NotificationList } from "@/features/notifications/ui/NotificationList";
import { Field } from "@/features/eu-inspections";

import type { Employee, NotificationStatus } from "@/types";

import { Summary } from "./Summary";
import { ChangeResponsibleModal } from "../ChangeResponsibleModal";

import type { EuInspectionRow } from "../../types";

type Props = {
  activeItem: EuInspectionRow;
  employees: Employee[];
  statusBySubjectId: Map<string, NotificationStatus>;
  setEuInspections: Dispatch<SetStateAction<EuInspectionRow[]>>;
  sendNotification: (euInspectionIds: string[]) => Promise<void>;
  markStatus: (
    euInspectionIds: string[],
    status: "approved" | "rejected",
  ) => Promise<void>;
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
    <aside className="h-dvh flex flex-col gap-3 p-4">
      <div className="flex-1 flex flex-col gap-3 overflow-y-scroll scrollbar-hide">
        <section className="flex flex-col gap-2">
          <Summary item={activeItem} />
        </section>

        <section className="flex flex-col gap-2">
          <Eyebrow>Maintenance responsible</Eyebrow>

          <div className="raised-outline-panel p-2">
            {activeItem.vehicle.employee ? (
              <EditableEntityRow
                id={activeItem.vehicle.employee.id}
                label={activeItem.vehicle.employee.name}
                icon={<InitialsBadge label={activeItem.vehicle.employee.name} />}
                renderEditor={({ isOpen, onClose }) => (
                  <ChangeResponsibleModal
                    isOpen={isOpen}
                    onClose={onClose}
                    euInspectionIds={[activeItem.id]}
                    currentResponsibleId={activeItem.vehicle.employee?.id}
                    employees={employees}
                    setEuInspections={setEuInspections}
                    onLoadingChange={setIsLoading}
                  />
                )}
                isLoading={isLoading}
              />
            ) : (
              <div>Issues reading maintenance responsible.</div>
            )}
          </div>
        </section>

        <section className="flex flex-col gap-2">
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
        </section>
      </div>

      <div className="flex gap-2 mt-auto">
        <button
          onClick={() => sendNotification([activeItem.id])}
          className="
           flex-1 inline-flex items-center justify-center gap-2
           min-w-0 mt-auto h-10 
           btn btn-secondary"
          disabled={
            !activeItem.vehicle.employee ||
            statusBySubjectId.get(activeItem.id) === "queued"
          }
        >
          <Notify size={14} />
          <span className="truncate">
            Notify {activeItem.vehicle.employee?.name}
          </span>
        </button>
      </div>
    </aside>
  );
}
