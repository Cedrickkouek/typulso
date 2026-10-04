import { expect, test } from "@playwright/test";

test("navigation responsive, langue et thème", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Les mots font la course." })).toBeVisible();
  for (const width of [900, 390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    await expect(
      page
        .getByRole("navigation", { name: "Navigation principale", exact: true })
        .getByRole("link"),
    ).toHaveCount(4);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
  await page.getByRole("button", { name: "Switch interface to English", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Words on the move." })).toBeVisible();
  await page.getByRole("button", { name: "Switch to dark theme", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("deux navigateurs créent et rejoignent une salle par code", async ({ browser, baseURL }) => {
  const host = await browser.newContext({ baseURL });
  const peer = await browser.newContext({ baseURL });
  try {
    const suffix = Date.now().toString(36);
    const ownerName = `E2EHost${suffix}`;
    const peerName = `E2EGuest${suffix}`;
    const owner = await host.request.post("/api/auth/register", {
      headers: { Origin: baseURL! },
      data: { username: ownerName, password: `Only_test_${suffix}_password` },
    });
    expect(owner.ok()).toBe(true);
    const visitor = await peer.request.post("/api/auth/guest", {
      headers: { Origin: baseURL! },
      data: { username: peerName },
    });
    expect(visitor.ok()).toBe(true);
    const hostPage = await host.newPage();
    const peerPage = await peer.newPage();
    await hostPage.goto("/salles/nouvelle");
    await hostPage
      .getByRole("textbox", { name: "Nom de la salle", exact: true })
      .fill(`Recette E2E ${suffix}`);
    await hostPage.getByRole("button", { name: "Créer la salle", exact: true }).click();
    await expect(hostPage.getByRole("heading", { name: "Le salon", exact: true })).toBeVisible();
    const code = (await hostPage.locator(".code").innerText()).trim();
    await peerPage.goto("/rejoindre");
    await peerPage.getByRole("textbox", { name: "Code de la salle", exact: true }).fill(code);
    await peerPage.getByRole("button", { name: "Rejoindre la course", exact: true }).click();
    await expect(peerPage.getByRole("heading", { name: "Le salon", exact: true })).toBeVisible();
    await expect(
      hostPage.locator(".player-grid").getByText(peerName, { exact: true }),
    ).toBeVisible();
    await expect(peerPage.getByRole("button", { name: "Modifier les règles" })).toHaveCount(0);
    await peerPage.getByRole("button", { name: "Je suis prêt", exact: true }).click();
    await expect(
      hostPage.locator(".player").filter({ hasText: peerName }).getByText("Prêt", { exact: true }),
    ).toBeVisible();
    await hostPage.getByRole("button", { name: "Quitter", exact: true }).click();
    await hostPage
      .getByRole("dialog")
      .getByRole("button", { name: "Quitter", exact: true })
      .click();
    await expect(peerPage.getByRole("button", { name: "Modifier les règles" })).toBeVisible();
  } finally {
    await host.close();
    await peer.close();
  }
});

test("échauffement local mesuré par la frappe", async ({ page }) => {
  await page.goto("/entrainement");
  await page.getByRole("button", { name: "Commencer l’échauffement", exact: true }).click();
  const input = page.getByRole("textbox", { name: "Recopie le texte de l’exercice", exact: true });
  await input.pressSequentially("Bonjour la bande");
  await expect(input).toHaveValue("Bonjour la bande");
  await expect(page.getByText("100 %", { exact: true })).toBeVisible();
  await expect(page.getByText("11 %", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Recommencer", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Commencer l’échauffement", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Commencer l’échauffement", exact: true }).click();
  await expect(input).toHaveValue("");
});
