"use client";

import { Dispatch, SetStateAction, useRef, useState } from "react";

import { confirmWith, rejectWith, warningWith } from "@/lib/toast";
import { cn } from "@/lib/cn";
import { SelectDropdown, InitialsBadge } from "@/components/molecules";
import { AppModal } from "@/features/core/ui/AppModal";

import { updateMaintenanceResponsible } from "@/features/core/server-actions";
import { getEuInspection } from "../server-actions/queries";

import type { Employee } from "@/types";
import type { EuInspectionRow } from "../types";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  euInspectionIds: string[];
  // only meaningful for a single inspection — dims that entry in the
  // dropdown instead of letting you "reassign" to who's already responsible
  currentResponsibleId?: string;
  employees: Employee[];
  setEuInspections: Dispatch<SetStateAction<EuInspectionRow[]>>;
  onLoadingChange: (loading: boolean) => void;
};

export function ChangeResponsibleModal({
  isOpen,
  onClose,
  euInspectionIds,
  currentResponsibleId,
  employees,
  setEuInspections,
  onLoadingChange,
}: Props) {
  const [dropdownChoice, setDropdownChoice] = useState<Employee | undefined>();
  const [openDropdown, setOpenDropdown] = useState(false);

  // set right before closing the dropdown on commit, so the text input's
  // resulting refocus doesn't immediately reopen it
  const suppressReopenRef = useRef(false);

  const assign = async () => {
    if (!dropdownChoice) return;
    onLoadingChange(true);
    onClose();

    const results = await Promise.all(
      euInspectionIds.map(async (id) => {
        const inspectionResult = await getEuInspection(id);
        if (!inspectionResult.ok) return { id, ok: false as const };

        const updateResult = await updateMaintenanceResponsible(
          inspectionResult.data.vehicle.id,
          dropdownChoice.id,
        );
        return { id, ok: updateResult.ok };
      }),
    );

    const succeededIds = new Set(results.filter((r) => r.ok).map((r) => r.id));

    setEuInspections((prev) =>
      prev.map((item) =>
        succeededIds.has(item.id)
          ? { ...item, vehicle: { ...item.vehicle, employee: dropdownChoice } }
          : item,
      ),
    );

    const failed = results.length - succeededIds.size;
    const success = succeededIds.size;

    const plural = results.length > 1;

    if (failed === 0) {
      confirmWith(
        "Responsible updated!",
        plural ? "Updates were successful." : "Update was successful.",
      );
    } else if (success === 0) {
      rejectWith(
        "Update failed",
        plural ? "Updates were unsuccessful." : "Update was unsuccessful.",
      );
    } else {
      warningWith(
        "Some updates failed",
        `${success} updated, ${failed} failed.`,
      );
    }

    onLoadingChange(false);
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign responsibility"
      className="min-w-sm"
      actions={[
        { label: "Cancel", variant: "neutral", onClick: onClose },
        { label: "Assign", variant: "primary", onClick: assign },
      ]}
    >
      <div className="flex flex-col gap-1">
        <span className="text-subtle text-sm">Employee</span>
        <SelectDropdown
          options={employees}
          getLabel={(emp) => emp.name}
          getKey={(emp) => emp.id}
          onCommit={(emp) => {
            setDropdownChoice(emp);
            suppressReopenRef.current = true;
            setOpenDropdown(false);
          }}
          galleryItem={(emp, handleCommit) => {
            const isCurrentResponsible = emp.id === currentResponsibleId;
            return (
              <div
                role="button"
                onClick={() => handleCommit(emp)}
                className={cn(isCurrentResponsible && "pointer-events-none")}
              >
                <InitialsBadge
                  label={emp.name}
                  className={cn(
                    isCurrentResponsible && "opacity-60 [&>span]:text-muted",
                    "hover:bg-accent/8 min-h-12 cursor-pointer p-2",
                  )}
                />
              </div>
            );
          }}
          dropdownProps={{ open: openDropdown, onOpenChange: setOpenDropdown }}
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
      </div>
    </AppModal>
  );
}
