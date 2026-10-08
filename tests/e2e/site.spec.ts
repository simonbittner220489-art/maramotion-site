import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import pages from '../../db/seed-data/pages.json';

const viewports = [[2560,1440],[1920,1080],[1440,900],[1366,768],[1024,768],[768,1024],[430,932],[390,844],[375,812]];
test('all source pages, SEO, downloads, internal links, and nine viewports', async ({ page, request }) => {
  test.setTimeout(300000);
  const links = new Set<string>();
  for (const source of pages) {
    const response = await page.goto(source.slug === 'home' ? '/' : `/${source.slug}`, { waitUntil: 'domcontentloaded' });
    expect(response?.status(), source.slug).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('head link[rel=canonical]')).toHaveAttribute('href', /http/);
    for (const href of await page.locator('a[href^="/"]').evaluateAll(nodes => nodes.map(node => node.getAttribute('href')!))) if (!href.startsWith('/admin')) links.add(href);
    for (const [width, height] of viewports) {
      await page.setViewportSize({ width, height });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `${source.slug} at ${width}`).toBe(true);
    }
    expect(await page.locator('img').evaluateAll(images => images.filter(image => image instanceof HTMLImageElement && image.complete && image.naturalWidth === 0).length), source.slug).toBe(0);
  }
  for (const href of links) expect((await request.get(href)).status(), href).toBe(200);
  expect((await request.get('/jaguar/index.html')).url()).toContain('/jaguar');
  expect((await request.get('/a-page-that-does-not-exist')).status()).toBe(404);
  expect((await request.get('/sitemap.xml')).status()).toBe(200);
});
test('mobile navigation, reduced motion, legal links, animal search and quiz', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.getByRole('button', { name: 'Menü +' }).click();
  await expect(page.getByRole('button', { name: 'Schließen −' })).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Menü +' })).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByRole('button', { name: 'Datenschutz-Einstellungen' })).toHaveCount(0);
  await expect(page.locator('footer').getByRole('link', { name: 'Haftungsausschluss und Datenschutzbestimmungen' })).toHaveAttribute('href', '/rechtliches');
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
  await page.goto('/entdecke-die-tiere-des-regenwaldes');
  await page.getByRole('searchbox').fill('Jaguar');
  await expect(page.locator('.animal-card')).toHaveCount(1);
  await page.locator('.animal-card').click();
  await page.locator('.quiz-options button').first().click();
  await expect(page.locator('.quiz-feedback').first()).not.toBeEmpty();
});
test('contact submission is visible in admin; content edits and uploads render publicly', async ({ page, request }) => {
  await page.goto('/kontakt');
  await page.getByLabel('Dein Name').fill('QA Rainforest Reader');
  await page.getByLabel('E-Mail-Adresse', { exact: false }).fill('reader@example.invalid');
  await page.getByLabel('Was möchtest du erzählen?').fill('QA contact message for verification.');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Nachricht senden' }).click();
  await expect(page.locator('.success-message')).toBeVisible();
  await page.goto('/admin');
  await page.getByLabel('E-Mail-Adresse', { exact: true }).fill(process.env.E2E_ADMIN_EMAIL!);
  await page.getByLabel('Passwort', { exact: true }).fill(process.env.E2E_ADMIN_PASSWORD!);
  await page.getByRole('button', { name: 'Sicher anmelden' }).click();
  await expect(page.getByRole('heading', { name: 'Deine Regenwaldwelt.' })).toBeVisible();
  await page.getByRole('button', { name: 'Kontaktanfragen', exact: true }).click();
  await expect(page.getByText('QA contact message for verification.')).toBeVisible();
  await page.locator('.lead-card').filter({ hasText: 'QA contact message for verification.' }).getByRole('combobox').selectOption('read');
  await expect(page.getByRole('status')).toContainText('Status gespeichert');
  await page.getByRole('button', { name: 'Seiten & Tiere' }).click();
  await page.locator('.admin-page-row').filter({ hasText: '/jaguar' }).getByRole('link', { name: 'Bearbeiten' }).click();
  await page.getByLabel('SEO-Beschreibung').fill('QA verified description for the Jaguar.');
  await page.getByRole('button', { name: 'Änderungen speichern' }).first().click();
  await expect(page.getByRole('status')).toContainText('Gespeichert.');
  await page.goto('/jaguar');
  await expect(page.locator('meta[name=description]')).toHaveAttribute('content', 'QA verified description for the Jaguar.');
  await page.goto('/admin');
  await page.getByRole('button', { name: 'Mediathek', exact: true }).click();
  await page.getByLabel('Bild auswählen').setInputFiles('public/images/f7cf8f061c2c.webp');
  await page.getByRole('button', { name: 'Bild hochladen' }).click();
  await expect(page.getByRole('status')).toContainText('Bild hochgeladen.');
  const mediaPath = await page.getByLabel('Bildpfad', { exact: true }).first().inputValue();
  expect((await request.get(mediaPath)).headers()['content-type']).toBe('image/webp');
  await page.getByRole('button', { name: 'Abmelden', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Willkommen zurück.' })).toBeVisible();
});
test('API denies missing origin, unauthorized writes and invalid consent; key pages pass axe', async ({ request, page }) => {
  expect((await request.post('/api/contact', { data: { name: 'Test', consentGdpr: true } })).status()).toBe(403);
  expect((await request.post('/api/content/pages', { headers: { Origin: 'http://localhost:3001' }, data: {} })).status()).toBe(401);
  expect((await request.get('/api/contacts')).status()).toBe(401);
  expect((await request.post('/api/contact', { headers: { Origin: 'http://localhost:3001' }, data: { name: 'Test', consentGdpr: false } })).status()).toBe(400);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const path of ['/', '/jaguar', '/kontakt', '/admin']) {
    await page.goto(path);
    const result = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
    expect(result.violations.map(issue => ({ id: issue.id, nodes: issue.nodes.map(node => node.target) })), path).toEqual([]);
  }
});
