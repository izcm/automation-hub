import { Locator, Page, test } from "@playwright/test";

async function clickAndWait(locator: Locator, timeout: number = 1500) {
  await locator.click();
  await locator.page().waitForTimeout(timeout);
}

function tableCard(page: Page, testId: string, rowName?: string) {
  const section = page.getByTestId(testId);
  const table = section.getByRole("table");
  const row = table.getByRole("row", { name: rowName });

  return { section, table, row };
}

async function highlightLocator(locator: Locator, timeout: number = 2000) {
  await locator.evaluate((element) => {
    const el = element as HTMLElement;

    el.style.position = "relative";
    el.style.zIndex = "9999";
    el.style.boxShadow = "0 0 0 9999px rgba(0, 0, 0, 0.65)";
  });

  await locator.page().waitForTimeout(timeout);

  await locator.evaluate((element) => {
    const el = element as HTMLElement;

    el.style.removeProperty("z-index");
    el.style.removeProperty("position");
    el.style.removeProperty("box-shadow");
  });
}

test("dashboard overview", async ({ page }) => {
  await page.goto("/eu-inspections");

  await page.waitForTimeout(4000);

  {
    const { section, row } = tableCard(
      page,
      "assignments-card",
      "Long-haul Nordics",
    );

    await highlightLocator(section);
    await clickAndWait(row);
  }

  {
    const { section, row } = tableCard(
      page,
      "responsible-employees-card",
      "Sindre Eriksen",
    );

    await highlightLocator(section);
    await clickAndWait(row);
  }

  // show some random filters
});
