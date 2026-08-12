import * as z from "zod";

// todo: make read layer
import { vehicleRepo } from "@/server/mongo/vehicles/repository";
import { notificationActions } from "@/server/di";

const NotificationBatchRequest = z.object({
  vehicleIds: z.string().array(),
  channel: z.literal("email"),
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
  const { vehicleIds, channel } = parsed.data;

  try {
    // get mainenance responsible users
    const data = await vehicleRepo.findByKeys(vehicleIds);
    console.log(data);
    const receiverIds = (await vehicleRepo.findByKeys(vehicleIds)).flatMap(
      (v) => (v.maintenanceResponsibleId ? v.maintenanceResponsibleId : []),
    );

    console.log(receiverIds);

    const result = await notificationActions.ingestNoficationRequests(
      receiverIds,
      channel,
    );

    console.log(result);

    return Response.json({ ok: true, data: result });
  } catch (error) {
    console.error("Failed to send notifications:", error);

    return Response.json(
      { error: "Kunne ikke sende varsler" },
      { status: 500 },
    );
  }
}
