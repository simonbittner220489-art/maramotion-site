import type { Metadata } from 'next';
import { animalNames, hrefFor, imageOf, siteUrl } from './site';
import type { pages } from '@/db/schema';

type Page = typeof pages.$inferSelect;
export function pageMetadata(page: Page | null): Metadata {
  if (!page || !page.published) return { title: 'Seite nicht gefunden', robots: { index: false, follow: false } };
  const title = page.seoTitle || page.title;
  const description = page.seoDescription || page.excerpt || '';
  const image = imageOf(page.blocks)?.src || '/images/f7cf8f061c2c.webp';
  return { title, description, alternates: { canonical: hrefFor(page.slug) }, openGraph: { title, description, url: hrefFor(page.slug), siteName: 'Maras Regenwaldwelt', locale: 'de_DE', type: 'website', images: [{ url: image }] }, twitter: { card: 'summary_large_image', title, description, images: [image] } };
}
export function structuredPage(page: Page) {
  const url = `${siteUrl()}${hrefFor(page.slug)}`;
  return { '@context': 'https://schema.org', '@graph': [
    { '@type': animalNames[page.slug] ? 'Article' : 'WebPage', '@id': url, url, name: page.seoTitle || page.title, headline: page.title, description: page.seoDescription, inLanguage: 'de', author: { '@type': 'Person', name: 'Wolfgang Bittner' }, image: `${siteUrl()}${imageOf(page.blocks)?.src || '/images/f7cf8f061c2c.webp'}` },
    { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Startseite', item: siteUrl() }, { '@type': 'ListItem', position: 2, name: page.title, item: url }] },
  ] };
}
