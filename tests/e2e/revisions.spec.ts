import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { animalNames } from '../../lib/site';

const welcome = 'Willkommen in Maras Regenwaldwelt';
const review = 'Wenn euch eines oder mehrere dieser Bücher gefallen haben, dann hinterlasst mir bitte eine positive Rezension, sofern ihr diese(s) über Amazon.de erworben habt.';

test('homepage and footer reflect requested removals, wording and both songs', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.hero a')).toHaveCount(0);
  await expect(page.locator('.hero .eyebrow')).toHaveCount(0);
  await expect(page.locator('.hero-bottom')).toHaveText('ENTDECKEN. STAUNEN. SCHÜTZEN.');
  await expect(page.getByText('Eine kleine Auswahl an Bewohnern des Regenwaldes', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Weitere Tiere kennenlernen' })).toHaveAttribute('href', '/entdecke-die-tiere-des-regenwaldes');
  await expect(page.locator('img[src*="8b748f11b063"]')).toHaveCount(0);
  await expect(page.locator('footer')).not.toContainText('Über Wolfgang');
  await expect(page.locator('footer')).not.toContainText('Eine Regenwaldwelt von Wolfgang Bittner');
  await expect(page.locator('footer').getByRole('link', { name: 'Über mich', exact: true })).toHaveAttribute('href', '/uber-mich');
  await expect(page.getByRole('button', { name: 'Datenschutz-Einstellungen' })).toHaveCount(0);
  await expect(page.locator('audio')).toHaveCount(2);
  await expect(page.locator('audio').first()).toHaveAttribute('src', /mara-regenwaldfest\.mp3$/);
  await expect(page.locator('audio').last()).toHaveAttribute('src', /mara-gemeinsam-sind-wir-stark\.mp3$/);
});

test('rainforest, catalog, contact and books show the requested imagery and hierarchy', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const path of ['/der-regenwald', '/kontakt']) {
    await page.goto(path);
    await expect(page.locator('.rainforest-hero img')).toBeVisible();
    await expect.poll(() => page.locator('.rainforest-hero img').evaluate(node => node instanceof HTMLImageElement && node.complete && node.naturalWidth > 0)).toBe(true);
    expect(await page.locator('.rainforest-hero img').evaluate(node => Number(getComputedStyle(node).zIndex))).toBeGreaterThanOrEqual(0);
    await expect(page.locator('.rainforest-hero h1')).toHaveCount(1);
    await expect(page.locator('.detail-hero .eyebrow')).toHaveText(welcome);
  }
  await expect(page.locator('.article-body')).toContainText(review);
  await expect(page.locator('.article-body')).not.toContainText('Wenn euch dieses Buch gefallen hat');
  await expect(page.locator('img[src*="844b3630c87e"]')).toHaveCount(0);
  await expect(page.locator('.article-body').getByText('Der Regenwald', { exact: true })).toHaveCount(0);
  await page.goto('/der-regenwald');
  await expect(page.locator('.article-body h2')).toHaveCount(7);
  expect(await page.locator('.article-body h2').evaluateAll(nodes => nodes.every(node => parseFloat(getComputedStyle(node).fontSize) >= 30 && getComputedStyle(node).fontWeight === '800'))).toBe(true);
  await page.goto('/entdecke-die-tiere-des-regenwaldes');
  await expect(page.locator('.expert-poster')).toBeVisible();
  await expect(page.locator('.animal-card')).toHaveCount(12);
  await page.goto('/maras-abenteuer');
  await expect(page.locator('h1')).toHaveText('Maras Abenteuer');
  await expect(page.locator('.mara-growing img')).toHaveAttribute('src', /mara-baby-und-erwachsen/);
  await expect(page.locator('.adventure-cover img')).toHaveCount(2);
  await expect(page.locator('.adventures-content img')).toHaveCount(3);
  const sizes = await page.locator('.adventure-cover img').evaluateAll(nodes => nodes.map(node => [node.getBoundingClientRect().width, node.getBoundingClientRect().height]));
  expect(sizes[0]).toEqual(sizes[1]);
  await expect(page.locator('audio')).toHaveCount(2);
  for (const path of ['/der-regenwald', '/entdecke-die-tiere-des-regenwaldes', '/maras-abenteuer', '/kontakt']) {
    await page.goto(path);
    const scan = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(scan.violations.map(issue => ({ id: issue.id, nodes: issue.nodes.map(node => node.target) })), path).toEqual([]);
  }
});

test('desktop and mobile navigation expose main pages and all animal subcategories', async ({ page }) => {
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    if (width === 390) await page.getByRole('button', { name: 'Menü +' }).click();
    const nav = page.getByRole('navigation', { name: 'Hauptnavigation' });
    await expect(nav.getByRole('link', { name: 'Maras Abenteuer', exact: true })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Über mich', exact: true })).toBeVisible();
    await nav.getByRole('button', { name: 'Tierseiten anzeigen' }).click();
    for (const [slug, name] of Object.entries(animalNames)) await expect(page.locator('#nav-animals').getByRole('link', { name, exact: true })).toHaveAttribute('href', `/${slug}`);
    await expect(page.locator('#nav-animals a')).toHaveCount(12);
    await page.keyboard.press('Escape');
    await expect(nav.getByRole('button', { name: 'Tierseiten anzeigen' })).toBeFocused();
    await expect(page.locator('#nav-animals')).toBeHidden();
    await nav.getByRole('button', { name: 'Rechtliche Seiten anzeigen' }).click();
    await expect(page.locator('#nav-legal').getByRole('link', { name: 'Impressum', exact: true })).toBeVisible();
    await expect(page.locator('#nav-legal').getByRole('link', { name: 'Haftungsausschluss und Datenschutzbestimmungen' })).toHaveAttribute('href', '/rechtliches');
    await nav.getByRole('button', { name: 'Tierseiten anzeigen' }).click();
    await page.locator('#nav-animals').getByRole('link', { name: 'Jaguar', exact: true }).click();
    await expect(page).toHaveURL(/\/jaguar$/);
    await expect(page.locator('#nav-animals')).toBeHidden();
  }
});
