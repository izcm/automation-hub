import {
  NotificationBatchWriteRequest,
  processNotificationBatch,
} from "@/server/api/notifications";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = NotificationBatchWriteRequest.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: "Invalid Request" }, { status: 400 });
  }

  try {
    const result = await processNotificationBatch(parsed.data);

    return Response.json({ ok: true, data: result });
  } catch (error) {
    console.error("Failed to send notifications:", error);

    return Response.json(
      { error: "Could not send notifications" },
      { status: 500 },
    );
  }
}
