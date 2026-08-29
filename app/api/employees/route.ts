// app/api/employees/route.ts

import { NextResponse } from "next/server";

import { powerOfficeFetch } from "@/server/external/power-office/client";

export async function GET() {
  throw new Error("Not implemented");

  const result = await powerOfficeFetch("/employees");
  // todo: handle result
  return NextResponse.json(result);
}
