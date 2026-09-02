import { messageBuilder, notificationActions } from "@/server/di";
import { NotificationBatchInput } from "./schema";

export async function processNotificationBatch({
  payload,
  channel,
  useCase,
}: NotificationBatchInput) {
  const messageRequests = await messageBuilder.buildMessages(
    payload,
    channel,
    useCase,
  );

  return notificationActions.ingestNotificationRequests(messageRequests);
}
