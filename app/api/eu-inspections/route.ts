import QueryString from "qs";
import { NextRequest, NextResponse } from "next/server";

import {
  EuInspectionPageRequest,
  getEuInspectionsPage,
} from "@/server/boundry/eu-inspections";

export async function GET(request: NextRequest) {
  const parsedQuery = QueryString.parse(request.nextUrl.search.slice(1));

  const parsed = EuInspectionPageRequest.safeParse(parsedQuery);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }

  try {
    const page = await getEuInspectionsPage(parsed.data);

    return NextResponse.json(page);
  } catch (error) {
    console.error("Failed to read eu-inspections:", error);

    return NextResponse.json(
      { error: "Could not read eu-inspections" },
      { status: 500 },
    );
  }
}
