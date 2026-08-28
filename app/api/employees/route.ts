// app/api/employees/route.ts

import { powerOfficeFetch } from "@/server/external/power-office/client";

export async function GET() {
  throw new Error("Not implemented");

  const result = await powerOfficeFetch("/employees");
  // todo: handle result
  return Response.json(result);
}
