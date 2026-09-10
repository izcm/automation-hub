"use server";

import { readCount, readPage } from "@/server/di";
import { safeAction } from "@/lib/safe-action";

export async function getEmployees() {
  return safeAction(async () => {
    const count = await readCount("employees");
    return (await readPage("employees", { limit: count })).items;
  }, "Failed to load employees");
}
