import * as z from "zod";

import { channels } from "@/server/domain/notifications/messaging/types";
import { MESSAGE_USE_CASES } from "@/server/domain/notifications/messaging/templates";

// Framework-agnostic — no Request/Response, no status codes. A route handler
// (Next.js, Express, Fastify, whatever)
export const NotificationBatchWriteRequest = z.strictObject({
  // opaque here — each use case's builder validates its own shape (e.g.
  // eu-inspection-reminder expects `vehicleIds`, a future use case might
  // expect something else entirely). See messaging/builders.ts.
  payload: z.record(z.string(), z.unknown()),
  channel: z.enum(channels),
  useCase: z.enum(MESSAGE_USE_CASES),
});

export type NotificationBatchInput = z.infer<
  typeof NotificationBatchWriteRequest
>;
