import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db/client';
import { uploads } from '@/db/schema';
import { getCurrentUser, requireUser } from '@/lib/auth';
import { assertOrigin, apiError, HttpError } from '@/lib/security';
import { validateAndOptimizeImage } from '@/lib/upload';

export async function GET(request: NextRequest) {
  try {
    requireUser(await getCurrentUser(request), ['admin', 'editor']);
    return NextResponse.json({ media: await getDb().select().from(uploads).orderBy(uploads.createdAt) });
  } catch (error) { return apiError(error); }
}
export async function POST(request: NextRequest) {
  try {
    assertOrigin(request);
    const user = requireUser(await getCurrentUser(request), ['admin', 'editor']);
    const size = Number(request.headers.get('content-length'));
    if (!size || size > 5300000) throw new HttpError(413, 'Maximal 5 MB pro Upload.');
    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File)) throw new HttpError(400, 'Bitte ein Bild auswählen.');
    const image = await validateAndOptimizeImage(Buffer.from(await file.arrayBuffer()));
    const [media] = await getDb().insert(uploads).values({ ...image, originalName: file.name.slice(0, 200), uploadedBy: user.id }).returning();
    return NextResponse.json({ ...image, media }, { status: 201 });
  } catch (error) { return apiError(error); }
}
