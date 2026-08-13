import * as z from "zod";

// todo: make read layer
import { messageBuilder, notificationActions } from "@/server/di";
import { CHANNEL } from "@/server/messaging/types";
import { MESSAGE_USE_CASES } from "@/server/messaging/templates";
import {
  MAX_NOTIFICATIONS_PER_BATCH,
  MAX_ID_LENGTH,
} from "@/server/shared/limits";

const NotificationBatchRequest = z.strictObject({
  // `ids` is intentionally generic — each use case decides what they refer to.
  // eu-inspection-reminder treats them as vehicle IDs, while a future
  // party-at-my-place use case could treat them as user IDs.
  ids: z.string().max(MAX_ID_LENGTH).array().max(MAX_NOTIFICATIONS_PER_BATCH),
  channel: z.enum(CHANNEL),
  useCase: z.enum(MESSAGE_USE_CASES),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = NotificationBatchRequest.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: "Invalid Request" }, { status: 400 });
  }

  // this service will have the vehicle ids
  const { ids: vehicleIds, channel, useCase } = parsed.data;

  try {
    const messageRequests = await messageBuilder.buildMessages(
      vehicleIds,
      channel,
      useCase,
    );

    const result =
      await notificationActions.ingestNotificationRequests(messageRequests);

    return Response.json({ ok: true, data: result });
  } catch (error) {
    console.error("Failed to send notifications:", error);

    return Response.json(
      { error: "Could not send notifications" },
      { status: 500 },
    );
  }
}
