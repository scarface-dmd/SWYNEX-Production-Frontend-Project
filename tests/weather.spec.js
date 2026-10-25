import { test, expect } from "@playwright/test";

test("live Colombo weather loads and desktop/mobile layouts fit the viewport", async ({
  page,
}, testInfo) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Colombo, Sri Lanka" }),
  ).toBeVisible({ timeout: 25000 });
  await expect(
    page.getByRole("heading", { name: "Your next five days" }),
  ).toBeVisible();
  await expect(page.locator(".forecast-card")).toHaveCount(5);
  await expect(page.locator(".current-temperature")).not.toContainText("--");
  await expect(page.locator(".error-panel")).toHaveCount(0);
  await page.screenshot({
    path: testInfo.outputPath("desktop.png"),
    fullPage: true,
  });
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    if (width === 390)
      await page.screenshot({
        path: testInfo.outputPath("mobile.png"),
        fullPage: true,
      });
  }
  expect(errors).toEqual([]);
});

test("search finds a real Sri Lankan city and quick choices load a new forecast", async ({
  page,
}) => {
  await page.goto("/");
  const search = page.getByRole("textbox", {
    name: "Search for a Sri Lankan city",
  });
  await search.fill("Kandy");
  const result = page.getByRole("button", { name: /Kandy.*Sri Lanka/ });
  await expect(result).toBeVisible({ timeout: 20000 });
  await result.click();
  await expect(
    page.getByRole("heading", { name: "Kandy, Sri Lanka" }),
  ).toBeVisible({ timeout: 25000 });
  await expect(search).toBeFocused();
  await page.getByRole("button", { name: "Galle", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Galle, Sri Lanka" }),
  ).toBeVisible({ timeout: 25000 });
});

test("unknown cities have a clear message and the search error can be retried", async ({
  page,
}) => {
  let shouldFail = false;
  await page.route("https://geocoding-api.open-meteo.com/**", (route) =>
    shouldFail
      ? route.fulfill({ status: 503, body: "{}" })
      : route.fulfill({ json: {} }),
  );
  await page.goto("/");
  const search = page.getByRole("textbox", {
    name: "Search for a Sri Lankan city",
  });
  await search.fill("not-a-city");
  await expect(
    page.getByText("No Sri Lankan cities found", { exact: false }),
  ).toBeVisible();
  shouldFail = true;
  await search.fill("test");
  await expect(
    page.getByRole("button", { name: "Retry search" }),
  ).toBeVisible();
  shouldFail = false;
  await page.getByRole("button", { name: "Retry search" }).click();
  await expect(
    page.getByText("No Sri Lankan cities found", { exact: false }),
  ).toBeVisible();
});

test("weather errors offer retry and recover with real weather data", async ({
  page,
}) => {
  let shouldFail = true;
  await page.route("https://api.open-meteo.com/**", (route) =>
    shouldFail ? route.fulfill({ status: 503, body: "{}" }) : route.continue(),
  );
  await page.goto("/");
  await expect(page.getByRole("alert")).toContainText(
    "weather service is unavailable",
  );
  shouldFail = false;
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(
    page.getByRole("heading", { name: "Colombo, Sri Lanka" }),
  ).toBeVisible({ timeout: 25000 });
  shouldFail = true;
  await page.getByRole("button", { name: /Updated/ }).click();
  await expect(page.getByRole("alert")).toContainText("last loaded forecast");
  await expect(
    page.getByRole("heading", { name: "Colombo, Sri Lanka" }),
  ).toBeVisible();
});
