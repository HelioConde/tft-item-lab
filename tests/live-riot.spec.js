const { test, expect } = require("@playwright/test");

test.describe("Live Riot smoke", () => {
  test.skip(process.env.LIVE_RIOT_SMOKE !== "1", "Dedicated production smoke only.");

  test("loads the published Item Lab with a real Riot ID", async ({ page }) => {
    const response = await page.goto("./?riot=AlchemyFlames%23BR1&server=br1&period=month", { waitUntil: "domcontentloaded" });
    expect(response?.status(), "GitHub Pages URL must respond HTTP 200; check Settings > Pages before testing Riot").toBe(200);
    await expect(page.locator("#lookup-form"), "Published app shell missing; likely GitHub Pages 404 or stale deploy").toBeVisible({ timeout: 6000 });

    await expect(page.locator("#status")).toHaveText(/Dados Riot carregados\.|Exibindo o último histórico real/, { timeout: 25000 });
    await expect(page.locator("#result")).toBeVisible();
    await expect(page.locator("#player-name")).toContainText("AlchemyFlames#BR1");
    await expect(page.locator("#metric-games")).not.toHaveText("—");
  });
});
