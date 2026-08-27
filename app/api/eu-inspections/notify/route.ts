import {
  EuInspectionNotifyRequest,
  notifyAboutEuInspections,
} from "@/server/api/eu-inspections";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = EuInspectionNotifyRequest.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: "Invalid Request" }, { status: 400 });
  }

  try {
    const result = await notifyAboutEuInspections(parsed.data);

    return Response.json({ ok: true, data: result });
  } catch (error) {
    console.error("Failed to send eu-inspection notification:", error);

    return Response.json(
      { error: "Could not send notification" },
      { status: 500 },
    );
  }
}
