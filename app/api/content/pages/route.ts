import { NextRequest, NextResponse } from 'next/server';
import { listPages, getAllPages, createPage, getPage } from '@/lib/queries';
import { getCurrentUser, requireUser } from '@/lib/auth';
import { pageCreateSchema } from '@/lib/validation';
import { assertOrigin, apiError, readJson, HttpError } from '@/lib/security';

export async function GET(request: NextRequest) {
  try {
    const all = request.nextUrl.searchParams.get('all') === 'true';
    if (all) requireUser(await getCurrentUser(request), ['admin', 'editor']);
    return NextResponse.json({ pages: all ? await getAllPages() : await listPages() });
  } catch (error) { return apiError(error); }
}
export async function POST(request: NextRequest) {
  try {
    assertOrigin(request);
    requireUser(await getCurrentUser(request), ['admin', 'editor']);
    const data = pageCreateSchema.parse(await readJson(request));
    if (await getPage(data.slug)) throw new HttpError(409, 'Diese Adresse existiert bereits.');
    const [page] = await createPage({ ...data, content: data.blocks?.map(block => block.content || '').join('\n\n'), published: data.published ?? false, order: 100 });
    return NextResponse.json({ page }, { status: 201 });
  } catch (error) { return apiError(error); }
}
