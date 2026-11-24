import { Page } from "@playwright/test";

import { DELAY, pause, scrollToTop, showAndClick, showText } from "../helpers";

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
    const rejectedLegend = page
      .getByTestId("timeline-card")
      .getByRole("button", { name: "Rejected", exact: true });

    await showAndClick(rejectedLegend);
  }

  await showText(page, "Fra oversikt til detaljert visning");
  await pause(page, DELAY.medium);

  // redirect focus to drilldown button
  await showAndClick(page.getByRole("button", { name: "Drill to workspace" }));
}
