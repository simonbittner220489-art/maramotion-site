import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db/client';
import { pages, siteSettings } from '@/db/schema';
import { getCurrentUser, requireUser } from '@/lib/auth';
import { z } from 'zod';
import { assertOrigin, apiError, readJson, HttpError } from '@/lib/security';

const schema = z.object({
  navigation: z.array(z.object({ label: z.string().trim().min(1).max(50), href: z.string().regex(/^\/(?:[a-z0-9-]+)?$/) })).min(1).max(6).optional(),
  footer: z.object({ text: z.string().max(300) }).optional(),
  site_title: z.object({ text: z.string().min(1).max(100) }).optional(),
}).strict();
export async function GET(request: NextRequest) {
  try {
    requireUser(await getCurrentUser(request), ['admin']);
    const settings = await getDb().select().from(siteSettings);
    return NextResponse.json(Object.fromEntries(settings.map(setting => [setting.key, setting.value])));
  } catch (error) { return apiError(error); }
}
export async function PUT(request: NextRequest) {
  try {
    assertOrigin(request);
    requireUser(await getCurrentUser(request), ['admin']);
    const body = schema.parse(await readJson(request, 10000));
    const db = getDb();
    const paths = (await db.select({ slug: pages.slug }).from(pages)).map(page => page.slug === 'home' ? '/' : `/${page.slug}`);
    if (body.navigation?.some(link => !paths.includes(link.href))) throw new HttpError(400, 'Ein Navigationsziel existiert nicht.');
    await db.transaction(async tx => {
      for (const [key, value] of Object.entries(body)) await tx.insert(siteSettings).values({ key, value }).onConflictDoUpdate({ target: siteSettings.key, set: { value, updatedAt: new Date() } });
    });
    return NextResponse.json({ success: true });
  } catch (error) { return apiError(error); }
}
