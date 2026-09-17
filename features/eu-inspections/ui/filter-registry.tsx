import { ReactNode } from "react";

import { capitalize } from "@a2zb/lib";

import { Employee } from "@/types";
import { InitialsBadge } from "@/components/molecules";
import { timeBuckets } from "@/lib/time-bucket";

import {
  STATUS_COLOR,
  STATUS_LABELS,
  STATUS_OPTIONS,
  type Status,
} from "../logic/status";
import { ResourceFilterRegistry } from "./FilterBar";

export function buildFilterRegistry(
  employees: Employee[],
): ResourceFilterRegistry {
  return {
    status: {
      searchable: false,
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
      options: timeBuckets.map((bucket) => ({ id: bucket, label: bucket })),
      renderLabel: (predicateId: string) => capitalize(predicateId),
    },
  };
}
