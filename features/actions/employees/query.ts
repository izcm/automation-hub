"use server";

import { powerOfficeFetch } from "@/server/external/power-office/client";

export async function getEmployees() {
  try {
    return await powerOfficeFetch("/employees");
  } catch (error) {
    console.error("Failed to get employees:", error);

    throw new Error("Failed to get employees", {
      cause: error,
    });
  }
}
