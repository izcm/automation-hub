import { Page } from "@playwright/test";

import {
  DELAY,
  highlightByOutline,
  hoverAndClick,
  pause,
  showAndClick,
  showText,
} from "../helpers";

function tableCard(page: Page, testId: string, rowName: string) {
  const section = page.getByTestId(testId);
  const table = section.getByRole("table");
  const row = table.getByRole("row", { name: rowName });

  return { section, table, row };
}

export async function specificUse(page: Page) {
  // start the example from a clean dashboard
  await hoverAndClick(
    page
      .getByTestId("overview-card")
      .getByRole("button", { name: "Clear all" }),
  );

  await showText(page, "Vi tar et konkret eksempel");
  await showText(
    page,
    "Sindre er ikke tilgjengelig de fire neste ukene.\n Vi vil overføre ansvaret for inspeksjonene som har frist i denne perioden fra han til en annen ansatt.",
    DELAY.long * 2,
  );

  {
    const timeline = page.getByTestId("timeline-card");
    const statuses = ["First attempt", "Rejected", "Unresolved"].map((name) =>
      timeline.getByRole("button", { name, exact: true }),
    );

    // outline all of them at once, then click them one by one
    const removeOutlines = await Promise.all(statuses.map(highlightByOutline));
    await pause(page, DELAY.short);

    for (const status of statuses) {
      await hoverAndClick(status);
    }

    await pause(page, DELAY.short);
    await Promise.all(removeOutlines.map((remove) => remove()));
  }

  {
    const { row } = tableCard(page, "assignments-card", "Long-haul Nordics");

    await showAndClick(row);
  }

  {
    const { row } = tableCard(
      page,
      "responsible-employees-card",
      "Erik Nilsen",
    );

    await showAndClick(row);
  }

  await showAndClick(page.getByRole("button", { name: "Drill to workspace" }));

  await showText(page, "Disse oppføringene må vi gjøre noe med.");

  await pause(page, DELAY.medium);
}
