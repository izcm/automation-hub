import { expect, Page, test } from "@playwright/test";

import {
  addWalkthroughStyles,
  DELAY,
  flashOutline,
  highlightByOutline,
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
import { backFromListView, clearDashboardFilters, inspectFirst } from "./steps";

async function specificUseInteractiveTools(page: Page) {
  await showText(page, "Vi velger alle og overfører dem til Marte.");

  const selectAllCheckbox = page.getByLabel(/Select all rows/);
  await selectAllCheckbox.check();

  await expect(selectAllCheckbox).toBeChecked();
  await pause(page, DELAY.medium);

  // batch select menu is showing now
  const assignBtn = page.getByRole("button", { name: "Assign to" });
  await showAndClick(assignBtn);

  // get the textinput in change responsible modal
  const modal = page.getByRole("dialog", { name: "Assign responsibility" });

  await modal.getByRole("textbox").pressSequentially("Marte", { delay: 100 }); // search box
  await hoverAndClick(modal.getByRole("option", { name: /Marte/ })); // pick employee
  await showAndClick(
    modal.getByRole("button", { name: "Assign", exact: true }),
  ); // perform action

  // temporary i dont wanna reseed the db
  // await showAndClick(
  //   modal.getByRole("button", { name: "Cancel", exact: true }),
  // );

  await pause(page, DELAY.long);
  await inspectFirst(page);

  const responsibleCard = page
    .locator("aside")
    .locator("section")
    .filter({ hasText: "Maintenance responsible" })
    .locator(".raised-outline-panel");

  const removeOutline = await flashOutline(responsibleCard);
  await pause(page, DELAY.long);
  await removeOutline();

  const syncFiltersBtn = page.getByRole("button", {
    name: /no longer match filters/,
  });

  await showText(
    page,
    "Marte er nå ansvarlig for inspeksjonene og har blitt varslet på epost.",
  );

  await hoverAndClick(syncFiltersBtn);

  await backFromListView(page);
  await clearDashboardFilters(page);
  await pause(page, DELAY.long);
}

async function responsibleEmails() {}

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
