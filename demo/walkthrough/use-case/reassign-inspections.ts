import { expect, Page } from "@playwright/test";

import {
  DELAY,
  highlightByOutline,
  hoverAndClick,
  pause,
  showAndClick,
  showText,
} from "../helpers";
import {
  backFromListView,
  clearDashboardFilters,
  inspectFirst,
} from "../steps";

export async function reassignInspections(page: Page) {
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

  await modal.getByRole("textbox").pressSequentially("Marte", { delay: 200 }); // search box
  await hoverAndClick(modal.getByRole("option", { name: /Marte/ })); // pick employee
  await showAndClick(
    modal.getByRole("button", { name: "Assign", exact: true }),
  ); // perform action

  await pause(page, DELAY.long);
  await inspectFirst(page);

  await showText(page, "Marte er nå ansvarlig for inspeksjonene …");

  const responsibleCard = page
    .locator("aside")
    .locator("section")
    .filter({ hasText: "Maintenance responsible" })
    .locator(".raised-outline-panel");

  const removeCardOutline = await highlightByOutline(responsibleCard);
  await pause(page, DELAY.long);
  await removeCardOutline();

  await showText(page, "… og har blitt varslet på epost.");

  const row = page
    .getByRole("row")
    .filter({ hasText: "marte.olsen@izblocks.com" });
  await row.waitFor({ state: "visible" });

  const removeRowOutline = await highlightByOutline(row);
  await pause(page, DELAY.long);
  await removeRowOutline();

  const syncFiltersBtn = page.getByRole("button", {
    name: /no longer match filters/,
  });
  await hoverAndClick(syncFiltersBtn);

  await backFromListView(page);
  await clearDashboardFilters(page);
  await pause(page, DELAY.long);
}
