import type { MetadataRoute } from 'next';
import { listPages } from '@/lib/queries';
import { hrefFor, siteUrl } from '@/lib/site';
export const dynamic = 'force-dynamic';
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return (await listPages()).map(page => ({ url: `${siteUrl()}${hrefFor(page.slug)}`, lastModified: page.updatedAt || undefined }));
}
