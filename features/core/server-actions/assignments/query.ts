"use server";

import { readCount, readPage } from "@/server/di";
import { safeAction } from "@/lib/safe-action";

export async function getAssignments() {
  return safeAction(async () => {
    const count = await readCount("assignments");
    return (await readPage("assignments", { limit: count })).items;
  }, "Failed to load assignments");
}
