import { eq } from "drizzle-orm";

import { AssignmentPort } from "@/server/domain/assignments/port";
import { Assignment } from "@/types/assignment";
import { makeReadRepo } from "@server/db/postgres/core/read";

import { db } from "../pool";
import { assignmentsTable } from "./schema";

type AssignmentRow = typeof assignmentsTable.$inferSelect;

const toAssignment = (row: AssignmentRow): Assignment => ({
  id: row.id,
  name: row.name,
});

export const assignmentRepo: AssignmentPort = makeReadRepo(
  db,
  assignmentsTable,
  (table, key: string) => eq(table.id, key),
  "id",
  toAssignment,
);
