import QueryString from "qs";

import {
  EuInspectionPageRequest,
  getEuInspectionsPage,
} from "@/server/api/eu-inspections";

export async function GET(request: Request) {
  const parsedQuery = QueryString.parse(new URL(request.url).search.slice(1));

  const parsed = EuInspectionPageRequest.safeParse(parsedQuery);

  if (!parsed.success) {
    return Response.json({ error: "Invalid query" }, { status: 400 });
  }

  try {
    const page = await getEuInspectionsPage(parsed.data);

    return Response.json(page);
  } catch (error) {
    console.error("Failed to read eu-inspections:", error);

    return Response.json(
      { error: "Could not read eu-inspections" },
      { status: 500 },
    );
  }
}
