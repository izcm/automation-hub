"use server";

import { getDemoUserEmail } from "@/demo/user-email-store";
import { cookies } from "next/headers";

// null (not undefined) for both branches — a lookup with nothing found,
// whether that's checking the cookie store or the db
export async function getEmailStorage() {
  const session = (await cookies()).get("session")?.value;
  if (!session) return null;

  return getDemoUserEmail(session);
}
