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
