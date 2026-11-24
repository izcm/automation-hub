import { expect, Page, test } from "@playwright/test";

import {
  addWalkthroughStyles,
  DELAY,
  hoverAndClick,
  pause,
  showAndClick,
  showText,
} from "./helpers";
import {
  dashboardIntro,
  listViewIntro,
  specificUse as specificUseVisualization,
} from "./visualization";

async function specificUseInteractiveTools(page: Page) {
  await showText(page, "Vi velger alle og overfører dem til Mari.");

  const selectAllCheckbox = page.getByLabel(/Select all rows/);
  await selectAllCheckbox.check();

  await expect(selectAllCheckbox).toBeChecked();
  await pause(page, DELAY.medium);

  // batch select menu is showing now
  const assignBtn = page.getByRole("button", { name: "Assign to" });
  await showAndClick(assignBtn);

  // get the textinput in change responsible modal
  const modal = page.getByRole("dialog", { name: "Assign responsibility" });

  await modal.getByRole("textbox").pressSequentially("Mari", { delay: 100 }); // search box
  await hoverAndClick(modal.getByRole("option", { name: /Marte/ })); // pick employee
  await showAndClick(
    modal.getByRole("button", { name: "Assign", exact: true }),
  );

  await pause(page, DELAY.long);
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
