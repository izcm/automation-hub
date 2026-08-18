// app/api/employees/route.ts

import { powerOfficeFetch } from "@/server/power-office/client";

export async function GET() {
  const result = await powerOfficeFetch("/employees");

  // todo: handle result
  return Response.json(result);
}
