import { ReactNode } from "react";

import { capitalize } from "@a2zb/lib";

import { Employee, Assignment } from "@/types";
import { InitialsBadge } from "@/components/molecules";
import { timeBuckets } from "@/lib/time-bucket";
import { Calendar, Contract, Inspection, User } from "@/components/icons";

import {
  STATUS_COLOR,
  STATUS_LABELS,
  STATUS_OPTIONS,
  type Status,
} from "../../logic/status";
import { ResourceFilterRegistry } from "@/components/filtering";

export function buildFilterRegistry(
  employees: Employee[],
  assignments: Assignment[],
): ResourceFilterRegistry {
  return {
    status: {
      searchable: false,
      icon: <Inspection />,
      options: STATUS_OPTIONS.map((option) => ({
        id: option.status,
        label: option.label,
      })).filter((option) => option.id !== "unexpectedCase"),
      renderLabel: (predicateId: string) => (
        <div className="flex items-baseline gap-2">
          <div
            className="rounded-full size-2.5"
            style={{
              backgroundColor: `var(--${STATUS_COLOR[predicateId as Status]})`,
            }}
          />
          {capitalize(STATUS_LABELS[predicateId as Status])}
        </div>
      ),
    },
    responsible: {
      searchable: true,
      icon: <User />,
      options: employees.map((employee) => ({
        id: employee.id,
        label: employee.name,
      })),
      renderLabel: (predicateId: string) => {
        const employeeName =
          employees.find((emp) => emp.id === predicateId)?.name ??
          "Unknown employee";

        return (
          <div className="flex items-center gap-2">
            <InitialsBadge size="sm" label={employeeName} />
            {employeeName}
          </div>
        );
      },
    },
    timeBucket: {
      searchable: false,
      icon: <Calendar />,
      options: timeBuckets.map((bucket) => ({ id: bucket, label: bucket })),
      renderLabel: (predicateId: string) => capitalize(predicateId),
    },
    assignment: {
      searchable: true,
      icon: <Contract />,
      options: assignments.map((assignment) => ({
        id: assignment.id,
        label: assignment.name,
      })),
      renderLabel: (predicateId: string) =>
        assignments.find((a) => a.id === predicateId)?.name ??
        "Unknown assignment",
    },
  };
}
