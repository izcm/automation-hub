import { Page } from "@playwright/test";

import {
  DELAY,
  flashOutline,
  hoverAndClick,
  pause,
  showText,
} from "../helpers";

// list view walkthrough, runs after drilling into the workspace
export async function listViewIntro(page: Page) {
  // every filter pill (not the "+ Add filter" button)
  const filterGroups = await page.locator(".chip-in .chip").all();
  // const addFilterBtn = page.getByRole("button", { name: "+ Add filter" });

  // flash the filter groups
  const removeOutlines = await Promise.all(
    filterGroups.map((element) => flashOutline(element)),
  );

  await showText(page, "Filtrene vi satt gjelder fortsatt.");

  await pause(page, DELAY.long);
  await Promise.all(removeOutlines.map((remove) => remove()));

  await showText(page, "Sidepanelet viser detaljer per oppføring.");

  // open first list items detail pane
  const inspectBtn = page.getByRole("button", { name: "Inspect" }).first();
  await hoverAndClick(inspectBtn);

  await pause(page, DELAY.long);

  // back to the dashboard (icon-only arrow button, no accessible name)
  await hoverAndClick(page.locator("button:has(svg.lucide-arrow-left)"));
}
