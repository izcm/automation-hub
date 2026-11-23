import { test } from "@playwright/test";

// start logged out: ignore the saved session from auth.ts for this file
test.use({ storageState: { cookies: [], origins: [] } });

test("login simple", async ({ page }) => {
  // baseURL in playwright.config.ts makes this http://localhost:3000/login
  await page.goto("/login");

  // the demo account shown on the login page
  await page
    .getByLabel("Email address")
    .pressSequentially("demo", { delay: 200 });
  await page.getByLabel("Password").pressSequentially("demo", { delay: 200 });
  const loginBtn = page.getByRole("button", { name: "Log In" });

  await loginBtn.hover();
  await page.waitForTimeout(2000);
  await loginBtn.click();

  // wait until the app has sent us to the dashboard
  await page.waitForURL("**/eu-inspections");
});

test("login oidc", async ({ page }) => {
  await page.goto("/login");

  const button = page.getByRole("button", { name: "Microsoft Entra ID" });
  // await button.evaluate((element) => (element.style.backgroundColor = "red"));

  await page.waitForTimeout(2000);
  await button.click();
});
