import { Page } from "@playwright/test";

// scales every wait: 2 = twice as slow, 0.5 = twice as fast
export const PACE = 1;

export const DELAY = {
  short: 500, // hover before a click, settle after a click
  medium: 1000, // page load
  long: 2000, // time to look at something
} as const;

export async function pause(page: Page, ms: number) {
  await page.waitForTimeout(ms * PACE);
}
