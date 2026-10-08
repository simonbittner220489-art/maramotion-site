import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db/client';
import { contacts } from '@/db/schema';
import { getCurrentUser, requireUser } from '@/lib/auth';
import { assertOrigin, apiError, readJson } from '@/lib/security';
import { z } from 'zod';
import { desc, eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    requireUser(await getCurrentUser(request), ['admin']);
    return NextResponse.json({ contacts: await getDb().select().from(contacts).orderBy(desc(contacts.createdAt)).limit(500) }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return apiError(error); }
}
export async function PATCH(request: NextRequest) {
  try {
    assertOrigin(request);
    requireUser(await getCurrentUser(request), ['admin']);
    const body = z.object({ id: z.uuid(), status: z.enum(['new', 'read', 'replied', 'archived']) }).parse(await readJson(request, 2000));
    await getDb().update(contacts).set({ status: body.status }).where(eq(contacts.id, body.id));
    return NextResponse.json({ success: true });
  } catch (error) { return apiError(error); }
}
export async function DELETE(request: NextRequest) {
  try {
    assertOrigin(request);
    requireUser(await getCurrentUser(request), ['admin']);
    const { id } = z.object({ id: z.uuid() }).parse(await readJson(request, 2000));
    await getDb().delete(contacts).where(eq(contacts.id, id));
    return NextResponse.json({ success: true });
  } catch (error) { return apiError(error); }
}
