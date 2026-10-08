import { NextRequest, NextResponse } from 'next/server';
import { updatePage, deletePage } from '@/lib/queries';
import { getCurrentUser, requireUser } from '@/lib/auth';
import { apiError, assertOrigin, readJson, HttpError } from '@/lib/security';
import { pageUpdateSchema } from '@/lib/validation';
import { getDb } from '@/db/client';
import { pages } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

type Context = { params: Promise<{ id: string }> };
export async function GET(request: NextRequest, { params }: Context) {
  try {
    const id = z.uuid().parse((await params).id);
    const [page] = await getDb().select().from(pages).where(eq(pages.id, id)).limit(1);
    if (!page) throw new HttpError(404, 'Seite nicht gefunden.');
    if (!page.published) requireUser(await getCurrentUser(request), ['admin', 'editor']);
    return NextResponse.json({ page });
  } catch (error) { return apiError(error); }
}
export async function PUT(request: NextRequest, { params }: Context) {
  try {
    assertOrigin(request);
    requireUser(await getCurrentUser(request), ['admin', 'editor']);
    const id = z.uuid().parse((await params).id);
    const updates = pageUpdateSchema.parse(await readJson(request));
    const [page] = await updatePage(id, { ...updates, ...(updates.blocks ? { content: updates.blocks.map(block => block.content || '').join('\n\n') } : {}) });
    if (!page) throw new HttpError(404, 'Seite nicht gefunden.');
    return NextResponse.json({ page });
  } catch (error) { return apiError(error); }
}
export async function DELETE(request: NextRequest, { params }: Context) {
  try {
    assertOrigin(request);
    requireUser(await getCurrentUser(request), ['admin']);
    const id = z.uuid().parse((await params).id);
    const [existing] = await getDb().select().from(pages).where(eq(pages.id, id));
    if (existing && ['home', 'impressum', 'rechtliches', 'kontakt'].includes(existing.slug)) throw new HttpError(409, 'Diese Kernseite kann nicht gelöscht werden.');
    if (!(await deletePage(id)).length) throw new HttpError(404, 'Seite nicht gefunden.');
    return NextResponse.json({ success: true });
  } catch (error) { return apiError(error); }
}
