import { NextRequest, NextResponse } from "next/server";

import { readByKeys } from "@/server/di";

export async function GET(request: NextRequest) {
  const ids = request.nextUrl.searchParams.getAll("id");

  if (ids.length === 0) return NextResponse.json([]);

  try {
    const notifications = await readByKeys("notifications", ids);

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Failed to read notifications:", error);

    return NextResponse.json(
      { error: "Could not read notifications" },
      { status: 500 },
    );
  }
}
