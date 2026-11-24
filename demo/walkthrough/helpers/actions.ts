import { Locator, Page } from "@playwright/test";

import { highlightByOutline } from "./decorate";
import { DELAY, pause } from "./pace";

// smooth-scrolls so the element's top touches the top of the viewport
export async function scrollToTop(locator: Locator) {
  await locator.evaluate((element) =>
    element.scrollIntoView({ block: "start", behavior: "smooth" }),
  );
}

// parent for one element: outline + hover, wait, click, wait, remove outline
export async function showAndClick(
  locator: Locator,
  timeout: number = DELAY.short,
) {
  const page = locator.page();
  const removeOutline = await highlightByOutline(locator);

  await locator.hover();
  await pause(page, timeout);

  await removeOutline();
  await locator.click();
  await pause(page, timeout);
}

// hover, wait, then click
export async function hoverAndClick(
  locator: Locator,
  timeout: number = DELAY.short,
) {
  await locator.hover();
  await pause(locator.page(), timeout);
  await locator.click();
}

// shows text in a full-page overlay for `timeout` ms, then removes it
export async function showText(
  page: Page,
  text: string,
  timeout: number = DELAY.long,
) {
  await page.evaluate((text) => {
    const overlay = document.createElement("div");

    overlay.id = "walkthrough-text";
    overlay.textContent = text;
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.65);
      color: white;
      font-size: 2rem;
    `;

    document.body.appendChild(overlay);
  }, text);

  await pause(page, timeout);

  await page.evaluate(() =>
    document.getElementById("walkthrough-text")?.remove(),
  );
}
