import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { getDb, closeDb } from '../db/client';
import { pages, uploads, siteSettings } from '../db/schema';
import type { ImportedPage } from '../lib/types';

async function main() {
  const db = getDb();
  const imported: ImportedPage[] = JSON.parse(await readFile('db/seed-data/pages.json', 'utf8'));
  for (const page of imported) {
    const { slug, title, excerpt, content, blocks, seoTitle, seoDescription, canonicalUrl, published, order } = page;
    const values = { slug, title, excerpt, content, blocks, seoTitle, seoDescription, canonicalUrl, published, order };
    const insert = db.insert(pages).values(values);
    if (process.argv.includes('--refresh')) await insert.onConflictDoUpdate({ target: pages.slug, set: values });
    else await insert.onConflictDoNothing();
  }
  const media: { src: string; width: number; height: number; size: number }[] = JSON.parse(await readFile('db/seed-data/media.json', 'utf8'));
  const existing = await db.select({ path: uploads.path }).from(uploads);
  for (const image of media) {
    if (existing.some(row => row.path === image.src)) continue;
    await db.insert(uploads).values({ filename: image.src.split('/').pop()!, mimeType: 'image/webp', size: image.size, path: image.src, width: image.width, height: image.height });
  }
  await db.insert(siteSettings).values([
    { key: 'site_title', value: { text: 'Maras Regenwaldwelt' } },
    { key: 'footer', value: { text: 'Geschichten, die verbinden. Eine Welt, die wir schützen.' } },
    { key: 'navigation', value: [
      { label: 'Der Regenwald', href: '/der-regenwald' },
      { label: 'Die Tierwelt', href: '/entdecke-die-tiere-des-regenwaldes' },
      { label: 'Maras Bücher', href: '/maras-abenteuer' },
      { label: 'Für Erwachsene', href: '/fuer-eltern-und-paedagog-innen' },
    ] },
  ]).onConflictDoNothing();
  const saved = await db.select({ slug: pages.slug, content: pages.content }).from(pages);
  if (saved.length !== imported.length || saved.some(page => !page.content)) throw new Error('Seed verification failed');
  console.log(`Verified ${saved.length} persisted pages with complete content; ${media.length} media entries. No accounts seeded.`);
}
main().finally(closeDb);
