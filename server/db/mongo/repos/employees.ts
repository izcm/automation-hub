import { WithId } from "mongodb";
import { makeReadRepo, makeTsWrite } from "@a2zb/mongo";

import { Employee } from "@/types/employee";

import { EmployeePort } from "@server/domain/employees/port";

import { employees } from "../collections";
import { EmployeeDoc } from "../types/employee-doc";

// transform _id => id at repo layer
const toEmployee = ({ _id, ...doc }: WithId<EmployeeDoc>) => ({
  ...doc,
});

// Read commons — keyed by our own `id` field (not Mongo's `_id`).
const baseRead = makeReadRepo<EmployeeDoc, string, Employee>(
  employees,
  (id) => ({ id }),
  toEmployee,
);

const write = makeTsWrite(employees);

export const employeeRepo: EmployeePort = {
  // === read ===
  ...baseRead,

  // === write ===
  ensure: async function (email, id): Promise<{ id: string }> {
    const res = await write.updateOne(
      { email },
      { $setOnInsert: { id } },
      { upsert: true },
    );

    // inserted -> the id we assigned; matched -> its stored id
    const resolvedId = res.upsertedCount
      ? id
      : ((await employees().findOne({ email }))?.id ?? "");

    return { id: resolvedId };
  },
};
