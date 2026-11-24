import { expect, Page, test } from "@playwright/test";

import { addWalkthroughStyles, DELAY, pause, showText } from "./helpers";
import {
  dashboardIntro,
  listViewIntro,
  specificUse as specificUseVisualization,
} from "./visualization";

async function specificUseInteractiveTools(page: Page) {
  await showText(page, "Hubben er utstyrt med verktøyene vi trenger.");

  const selectAllCheckbox = page.getByLabel(/Select all rows/);
  await selectAllCheckbox.check();

  expect(selectAllCheckbox).toBeChecked();

  await pause(page, DELAY.medium);
}

test("dashboard overview", async ({ page }) => {
  await page.goto("/eu-inspections");
  await addWalkthroughStyles(page);

  await showText(page, "I Hubben får man oversikt over kommende inspeksjoner.");

  await pause(page, DELAY.medium);

  // visualization
  await dashboardIntro(page);
  await listViewIntro(page);
  await specificUseVisualization(page);

  // Interactive tools
  await specificUseInteractiveTools(page);
});
