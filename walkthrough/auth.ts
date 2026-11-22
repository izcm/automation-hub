import { test as setup } from "@playwright/test";

setup("authenticate", async ({ page }) => {
  await page.goto("/login");

  await page.getByLabel("Email address").fill("demo");
  await page.getByLabel("Password").fill("demo");
  await page.getByRole("button", { name: "Log In" }).click();
  await page.waitForURL("**/eu-inspections");

  // save the session cookie so the walkthrough clips start logged in
  await page.context().storageState({ path: "playwright/.auth/demo.json" });
});
