import { Dispatch, SetStateAction, useRef, useState } from "react";

import { rejectWith } from "@/lib/toast";

import { User, Notify, ChevronDown, Confirm, Cancel } from "@components/icons";
import { ClickPopover } from "@a2zb/react";
import { EditableEntityRow } from "@/components/organisms/EditableEntityRow";
import { Eyebrow } from "@/components/atoms";
import { SelectDropdown } from "@/components/molecules";

import { updateMaintenanceResponsible } from "@/features/core/server-actions";
import { NotificationList } from "@/features/notifications/ui/NotificationList";
import { Field } from "@/features/eu-inspections";

import type { Employee, NotificationStatus } from "@/types";

import { getEuInspection } from "../server-actions/queries";
import { EuInspectionSummary } from "./EuInspectionSummary";

import type { EuInspectionRow } from "../types";
import { AppModal } from "@/features/core/ui/AppModal";

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
  const [dropdownChoice, setDropdownChoice] = useState<Employee | undefined>();

  const [openDropdown, setOpenDropdown] = useState(false);

  const suppressReopenRef = useRef(false);

  // console.log(suppressReopenRef.current);
  return (
    <aside className="h-dvh flex flex-col gap-3 p-4">
      <div className="flex-1 flex flex-col gap-3 overflow-y-scroll scrollbar-hide">
        <section className="flex flex-col gap-2">
          <EuInspectionSummary item={activeItem} />
        </section>

        <section className="flex flex-col gap-2">
          <Eyebrow>Maintenance responsible</Eyebrow>

          <div className="raised-outline-panel p-2">
            {activeItem.vehicle.employee ? (
              <EditableEntityRow
                id={activeItem.vehicle.employee.id}
                label={activeItem.vehicle.employee.name}
                icon={<User size={20} strokeWidth={1} />}
                renderEditor={({ isOpen, onClose }) => (
                  <AppModal
                    isOpen={isOpen}
                    onClose={onClose}
                    title="Change maintenance responsible"
                    className="min-w-[400px]"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-subtle text-sm">Employee</span>
                      <SelectDropdown
                        options={employees}
                        getLabel={(emp) => emp.name}
                        getKey={(emp) => emp.id}
                        onCommit={() => {
                          suppressReopenRef.current = true;
                          setOpenDropdown(false);
                        }}
                        galleryItem={(emp, handleCommit) => (
                          <div onClick={() => handleCommit(emp)}>
                            <InitialBadge
                              label={emp.name}
                              className={cn(
                                dropdownChoice?.id === emp.id &&
                                  "[&>span]:text-muted",
                                "hover:bg-accent/8 h-12 cursor-pointer",
                              )}
                            />
                            {/* {option.name} */}
                          </div>
                        )}
                        dropdownProps={{
                          open: openDropdown,
                          onOpenChange: setOpenDropdown,
                        }}
                        textInputProps={{
                          htmlInputProps: {
                            onFocus: () => {
                              if (suppressReopenRef.current) {
                                suppressReopenRef.current = false;
                                return;
                              }
                              setOpenDropdown(true);
                            },
                            autoFocus: true,
                            id: "modal-focus-element",
                          },
                        }}
                      />
                      {/* <SelectDropdown
                        // options={employees}
                        // selected={activeItem.vehicle.employee}
                        // getLabel={(emp) => emp.name}
                        // getKey={(emp) => emp.id}
                        // onSelect={(newMaintenanceResponsible) => {
                        //   setDropdownChoice(newMaintenanrceResponsible);
                          // setIsLoading(true);
                          // onClose();

                          // const updateResult =
                          //   await updateMaintenanceResponsible(
                          //     activeItem.vehicle.id,
                          //     newMaintenanceResponsible.id,
                          //   );
                          // if (!updateResult.ok) {
                          //   rejectWith(updateResult.error);
                          //   setIsLoading(false);
                          //   return;
                          // }

                          // const inspectionResult = await getEuInspection(
                          //   activeItem.id,
                          // );
                          // if (!inspectionResult.ok) {
                          //   rejectWith(inspectionResult.error);
                          //   setIsLoading(false);
                          //   return;
                          // }

                          // setEuInspections((prev) =>
                          //   prev.map((item) =>
                          //     item.id === activeItem.id
                          //       ? inspectionResult.data
                          //       : item,
                          //   ),
                          // );
                          // setIsLoading(false);
                        }}
                        textInputProps={{
                          htmlInputProps: {
                            // autoFocus: true,
                            id: "modal-focus-element",
                          },
                        }} */}
                      {/* /> */}
                    </div>
                    <button className="btn btn-secondary py-1 self-end mt-6">
                      Cancel
                    </button>
                  </AppModal>
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

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type InitialBadge = {
  label: string;
  className?: string;
};

export const InitialBadge = ({ label, icon, className }: InitialBadge) => {
  const words = label.split(" ");

  const initials = [words[0]?.[0], words[words.length - 1]?.[0]]
    .filter((letter): letter is string => letter !== undefined)
    .slice(0, 2)
    .join("");

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className="
        flex items-center justify-center
        w-10 h-10 text-sm
        rounded-full
        bg-ground/40 border border-line/16
      "
      >
        {icon ? (
          icon
        ) : (
          // <i className={`devicon-${icon}-plain text-2xl`}></i>
          <span className="text-base">{initials.toUpperCase()}</span>
        )}
      </div>

      <span className="text-fg">{label}</span>
    </div>
  );
};
