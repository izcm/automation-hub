import { test } from "@playwright/test";

test("dashboard overview", async ({ page }) => {
  await page.goto("/eu-inspections");

  await page.waitForTimeout(5000);

  const assignmentsTable = page.getByRole("table", { name: "Assignments" });
  const row = assignmentsTable.getByRole("row", { name: "Long-haul Nordics" });

  await row.evaluate((element) => (element.innerHTML = "whatever"));
});
