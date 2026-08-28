import { readByKeys } from "@/server/di";

export async function GET(request: Request) {
  const ids = new URL(request.url).searchParams.getAll("id");

  if (ids.length === 0) return Response.json([]);

  try {
    const notifications = await readByKeys("notifications", ids);

    return Response.json(notifications);
  } catch (error) {
    console.error("Failed to read notifications:", error);

    return Response.json(
      { error: "Could not read notifications" },
      { status: 500 },
    );
  }
}
