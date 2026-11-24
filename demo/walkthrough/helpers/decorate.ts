import { Locator, Page } from "@playwright/test";

import { DELAY, pause } from "./pace";

// demo-only CSS, injected into the page so it works on the live site
const WALKTHROUGH_CSS = `
  .walkthrough-outline {
    outline: 2px solid var(--accent);
    outline-offset: -2px;
  }

  @keyframes walkthrough-border-flash {
    0%,
    100% {
      outline-color: transparent;
    }

    50% {
      outline-color: var(--accent);
    }
  } 

  .walkthrough-flash {
   animation: walkthrough-border-flash 1s ease-in-out infinite;
  }
`;

// call after every page.goto — a full page load drops injected styles
export async function addWalkthroughStyles(page: Page) {
  await page.addStyleTag({ content: WALKTHROUGH_CSS });
}

// adds classes and returns a function that removes them again
export async function addClasses(locator: Locator, classList: string) {
  const classes = classList.split(" ").filter(Boolean);

  await locator.evaluate(
    (element, classes) => element.classList.add(...classes),
    classes,
  );

  return () =>
    locator.evaluate(
      (element, classes) => element.classList.remove(...classes),
      classes,
    );
}

// adds an outline and returns a function that removes it again
export async function highlightByOutline(locator: Locator) {
  return addClasses(locator, "walkthrough-outline");
}

export async function flashOutline(locator: Locator) {
  return addClasses(locator, "walkthrough-outline walkthrough-flash");
}

export async function highlightByOverlay(
  locator: Locator,
  timeout: number = DELAY.long,
) {
  await locator.evaluate((element) => {
    const el = element as HTMLElement;

    el.style.position = "relative";
    el.style.zIndex = "9999";
    el.style.boxShadow = "0 0 0 9999px rgba(0, 0, 0, 0.65)";
  });

  await pause(locator.page(), timeout);

  await locator.evaluate((element) => {
    const el = element as HTMLElement;

    el.style.removeProperty("z-index");
    el.style.removeProperty("position");
    el.style.removeProperty("box-shadow");
  });
}
