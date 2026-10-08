import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/db/client';
import { verifyPassword, generateToken, hashToken, hashPassword } from '@/lib/auth';
import { createSessionCookie } from '@/lib/session';
import { users, sessions } from '@/db/schema';
import { eq, lt } from 'drizzle-orm';
import { assertOrigin, checkRateLimit, getClientIp, readJson, apiError, HttpError } from '@/lib/security';

const loginSchema = z.object({ email: z.email().max(254).transform(value => value.toLowerCase()), password: z.string().min(1).max(128) });
let dummyHash: Promise<string> | undefined;
export async function POST(request: NextRequest) {
  try {
    assertOrigin(request);
    if (!await checkRateLimit(getClientIp(request), 'login', 10)) throw new HttpError(429, 'Zu viele Versuche. Bitte warte 15 Minuten.');
    const { email, password } = loginSchema.parse(await readJson(request, 4000));
    if (!await checkRateLimit(hashToken(email), 'login-account', 5)) throw new HttpError(429, 'Zu viele Versuche. Bitte warte 15 Minuten.');
    const db = getDb();
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    dummyHash ||= hashPassword(generateToken());
    const valid = await verifyPassword(password, user?.passwordHash || await dummyHash);
    if (!user || !valid) throw new HttpError(401, 'E-Mail-Adresse oder Passwort ist nicht korrekt.');
    const token = generateToken();
    await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
    await db.insert(sessions).values({ userId: user.id, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + 86400000) });
    const response = NextResponse.json({ success: true });
    response.headers.set('Set-Cookie', createSessionCookie(token));
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch (error) { return apiError(error); }
}
