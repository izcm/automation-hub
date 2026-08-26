import { pgTable, text } from "drizzle-orm/pg-core";

import { timestampColumns } from "../shared/schemas";
import { euInspectionsTable } from "../eu-inspections/schema";
import { notificationsTable } from "../notifications/schema";

// we can't touch `notifications` (shared across use cases, no reference
// column) so this junction links a notification back to the eu-inspection
// it was sent about, without the notifications table knowing anything
// about eu-inspections.
export const euInspectionNotificationsTable = pgTable(
  "eu_inspection_notifications",
  {
    id: text("id").primaryKey(),
    euInspectionId: text("eu_inspection_id")
      .notNull()
      .references(() => euInspectionsTable.id),
    notificationId: text("notification_id")
      .notNull()
      .references(() => notificationsTable.id),
    ...timestampColumns,
  },
);
