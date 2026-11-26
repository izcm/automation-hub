import { expect, test } from "@playwright/test";
import { build } from "esbuild";

import { addWalkthroughStyles, DELAY, pause, showText } from "./helpers";
import { dashboardIntro, listViewIntro } from "./ui";
import { findInspections, reassignInspections } from "./use-case";

test("walkthrough", async ({ page }) => {
  await page.goto("/eu-inspections");

  const { outputFiles } = await build({
    stdin: {
      contents: `
        import React from "react";
        import { createRoot } from "react-dom/client";

        function Diagram() {
          return <div>HELLO</div>;
        }

        const el = document.createElement("div");
        
        el.id = "integrations-diagram";
        el.style.cssText = "position:fixed;inset:0;z-index:999999;background:white";
        
        document.body.append(el);
        
        createRoot(el).render(<Diagram />);
      `,
      loader: "tsx",
      resolveDir: process.cwd(),
    },
    bundle: true, // bundle dependencies
    write: false, // write in-memory
    format: "iife", // https://adhdecode.com/articles/esbuild/esbuild-iife-wrapping/
  });

  await page.addScriptTag({
    content: outputFiles[0]?.text,
  });

  await expect(page.getByText("HELLO")).toBeVisible();
  await page.locator("#integrations-diagram").evaluate((el) => el.remove());

  await addWalkthroughStyles(page);

  await showText(page, "I Hubben får man oversikt over kommende inspeksjoner.");

  await pause(page, DELAY.medium);

  // ui
  await dashboardIntro(page);
  await listViewIntro(page);

  // use case
  await findInspections(page);
  await reassignInspections(page);
});

// esbuild --bundle --format=iife --outfile=whatever/bundle.js <<'EOF'
// const greeting = "Hello from the IIFE!";
// console.log(greeting);

// function privateHelper() {
//   console.log("This is a private function.");
// }

// privateHelper();
// EOF

// ----------

// import { test } from "@playwright/test";
// import { build } from "esbuild";

// test("walkthrough", async ({ page }) => {
//   await page.goto("/eu-inspections");

//   const { outputFiles } = await build({
//     stdin: {
//       contents: `
//         import React from "react";
//         import { createRoot } from "react-dom/client";

//         function Diagram() {
//           return <div>HELLO</div>;
//         }

//         const el = document.createElement("div");
//         el.style.cssText = "position:fixed;inset:0;z-index:999999;background:white";
//         document.body.append(el);
//         createRoot(el).render(<Diagram />);
//       `,
//       loader: "tsx",
//       resolveDir: process.cwd(),
//     },
//     bundle: true,
//     write: false,
//     platform: "browser",
//     format: "iife", // https://adhdecode.com/articles/esbuild/esbuild-iife-wrapping/
//   });

//   await page.addScriptTag({ content: outputFiles[0].text });
// });
