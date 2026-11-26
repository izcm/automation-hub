import { Page } from "@playwright/test";

import {
  DELAY,
  hoverAndClick,
  pause,
  scrollToTop,
  showAndClick,
  showText,
} from "../helpers";
import { drillToWorkspace } from "../steps";

export async function dashboardIntro(page: Page) {
  await page
    .getByRole("navigation")
    .first()
    .evaluate((element) => (element.style.display = "none"));
  await pause(page, DELAY.short);

  await scrollToTop(page.getByRole("tab", { name: "Overview" }));

  await pause(page, DELAY.long);

  await showText(
    page,
    "Dashboardet er interaktivt, trykk rundt for å sette filtre.",
  );

  {
    const timeline = page.getByTestId("timeline-card");

    // just for show, the last click clears the status filter again
    for (const name of [
      "Approved",
      "First attempt",
      "Rejected",
      "Unresolved",
    ]) {
      await hoverAndClick(
        timeline.getByRole("button", { name, exact: true }),
        DELAY.short,
      );
    }
    await pause(page, DELAY.medium);
  }

  {
    const rejectedLegend = page
      .getByTestId("timeline-card")
      .getByRole("button", { name: "Rejected", exact: true });

    await showAndClick(rejectedLegend);
  }

  await showText(page, "Fra oversikt til detaljert visning");
  await pause(page, DELAY.medium);

  // redirect focus to drilldown button
  await drillToWorkspace(page);
}
