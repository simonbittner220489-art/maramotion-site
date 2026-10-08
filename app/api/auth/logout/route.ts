import { NextRequest, NextResponse } from 'next/server';
import { deleteSessionCookie, parseSessionCookie } from '@/lib/session';
import { getDb } from '@/db/client';
import { sessions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { hashToken } from '@/lib/auth';
import { checkOrigin } from '@/lib/security';

export async function POST(request: NextRequest) {
  try {
    if (!checkOrigin(request)) {
      return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
    }

    const token = parseSessionCookie(request.headers.get('cookie') || '');
    if (token) {
      const db = getDb();
      await db.delete(sessions).where(eq(sessions.tokenHash, hashToken(token)));
    }

    const response = NextResponse.json({ success: true }, { status: 200 });
    response.headers.set('Set-Cookie', deleteSessionCookie());
    return response;
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
