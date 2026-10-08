import bcryptjs from 'bcryptjs';
import { randomBytes, createHash } from 'crypto';
import type { NextRequest } from 'next/server';
import { getDb } from '@/db/client';
import { users, sessions } from '@/db/schema';
import { eq, and, gt } from 'drizzle-orm';
import { parseSessionCookie } from '@/lib/session';
import { cookies } from 'next/headers';

export async function hashPassword(password: string): Promise<string> {
  return bcryptjs.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcryptjs.compare(password, hash);
}

export function generateToken(): string {
  return randomBytes(32).toString('hex');
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export interface CurrentUser {
  id: string;
  email: string;
  name: string | null;
  role: string | null;
}

export async function getCurrentUser(request?: NextRequest): Promise<CurrentUser | null> {
  const cookieHeader = request ? request.headers.get('cookie') || '' : (await cookies()).toString();
  const token = parseSessionCookie(cookieHeader);
  if (!token) return null;

  const db = getDb();
  const tokenHash = hashToken(token);
  const now = new Date();

  const session = await db
    .select()
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.tokenHash, tokenHash), gt(sessions.expiresAt, now)))
    .limit(1);

  if (session.length === 0) return null;

  const user = session[0].users;
  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

export function requireUser(user: CurrentUser | null, roles?: string[]): CurrentUser {
  if (!user) throw new Error('Unauthorized');
  if (roles && (!user.role || !roles.includes(user.role))) throw new Error('Forbidden');
  return user;
}
