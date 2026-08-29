import { NextRequest, NextResponse } from "next/server";

import {
  EuInspectionNotifyRequest,
  notifyAboutEuInspections,
} from "@/server/api/eu-inspections";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = EuInspectionNotifyRequest.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
  }

  try {
    const result = await notifyAboutEuInspections(parsed.data);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to send eu-inspection notification:", error);

    return NextResponse.json(
      { error: "Could not send notification" },
      { status: 500 },
    );
  }
}
