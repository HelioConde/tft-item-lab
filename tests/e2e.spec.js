const { test, expect } = require("@playwright/test");

test("builds a personal item report from TFT match history", async ({ page }) => {
  const now = Date.now();
  await page.route("**/riot-legacy-tft-profile", async route => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        player: { gameName: "AlchemyFlames", tagLine: "BR1" },
        cacheMeta: { stale: false },
        matches: [
          {
            placement: 1, playedAt: now - 1 * 86400000, setNumber: 16,
            units: [
              { characterId: "TFT16_Ahri", itemNames: ["Jeweled Gauntlet", "Spear of Shojin"] },
              { characterId: "TFT16_Garen", itemNames: ["Warmog's Armor"] }
            ]
          },
          {
            placement: 4, playedAt: now - 2 * 86400000, setNumber: 16,
            units: [
              { characterId: "TFT16_Ahri", itemNames: ["Jeweled Gauntlet", "Blue Buff"] },
              { characterId: "TFT16_Garen", itemNames: ["Warmog's Armor"] }
            ]
          },
          {
            placement: 8, playedAt: now - 3 * 86400000, setNumber: 16,
            units: [
              { characterId: "TFT16_Kaisa", itemNames: ["Guinsoo's Rageblade", "Spear of Shojin"] }
            ]
          }
        ]
      })
    });
  });

  await page.goto("/");
  await page.locator("#riot-id").fill("AlchemyFlames#BR1");
  await page.locator("#lookup-form").getByRole("button").click();

  await expect(page.locator("#status")).toHaveText("Dados Riot carregados.");
  await expect(page.locator("#result")).toBeVisible();
  await expect(page.locator("#player-name")).toHaveText("AlchemyFlames#BR1");
  await expect(page.locator("#metric-games")).toHaveText("3");
  await expect(page.locator("#metric-items")).toHaveText("5");
  await expect(page.locator("#metric-most")).toHaveText(/Jeweled Gauntlet|Spear of Shojin|Warmog/);

  const item = page.locator('[data-item="Jeweled Gauntlet"]');
  await expect(item).toBeVisible();
  await item.click();
  await expect(page.locator("#detail-title")).toHaveText("Jeweled Gauntlet");
  await expect(page.locator("#detail-content")).toContainText("Ahri");
  await expect(page.locator("#unit-grid")).toContainText("Ahri");

  await page.locator('[data-sort="avg"]').click();
  await expect(page.locator('[data-sort="avg"]')).toHaveClass(/active/);

  await page.locator('[data-period="week"]').click();
  await expect(page.locator('[data-period="week"]')).toHaveClass(/active/);
});

test("validation, rate limit and language states stay clear", async ({ page }) => {
  await page.goto("/");
  await page.locator("#riot-id").fill("invalid");
  await page.locator("#lookup-form").getByRole("button").click();
  await expect(page.locator("#status")).toContainText("Nome#TAG");

  await page.route("**/riot-legacy-tft-profile", async route => {
    await route.fulfill({
      status: 429,
      contentType: "application/json",
      body: JSON.stringify({ error: "rate_limit" })
    });
  });
  await page.locator("#riot-id").fill("AlchemyFlames#BR1");
  await page.locator("#lookup-form").getByRole("button").click();
  await expect(page.locator("#status")).toContainText("Limite temporário");

  await page.locator("#language-toggle").click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("#lookup-form").getByRole("button")).toHaveText("Open my Item Lab");
});
