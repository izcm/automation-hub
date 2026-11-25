import { Page } from "@playwright/test";

import { hoverAndClick, showAndClick } from "./helpers";

// app-specific steps for this walkthrough; generic ones live in helpers/

export async function backFromListView(page: Page) {
  // icon-only arrow button, no accessible name
  await hoverAndClick(page.locator("button:has(svg.lucide-arrow-left)"));
}

export async function drillToWorkspace(page: Page) {
  await showAndClick(page.getByRole("button", { name: "Drill to workspace" }));
}

// opens the first list item's detail pane
export async function inspectFirst(page: Page) {
  await hoverAndClick(page.getByRole("button", { name: "Inspect" }).first());
}

export async function clearDashboardFilters(page: Page) {
  await hoverAndClick(
    page
      .getByTestId("overview-card")
      .getByRole("button", { name: "Clear all" }),
  );
}
