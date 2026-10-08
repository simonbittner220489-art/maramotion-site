import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import { getDb } from '@/db/client';
import { rateLimits } from '@/db/schema';
import { sql, lt } from 'drizzle-orm';
import { ZodError } from 'zod';

export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export function apiError(error: unknown) {
  if (error instanceof HttpError) return NextResponse.json({ error: error.message }, { status: error.status });
  if (error instanceof ZodError || error instanceof SyntaxError) return NextResponse.json({ error: 'Bitte prüfe deine Angaben.' }, { status: 400 });
  if (error instanceof Error && error.message === 'Unauthorized') return NextResponse.json({ error: 'Bitte anmelden.' }, { status: 401 });
  if (error instanceof Error && error.message === 'Forbidden') return NextResponse.json({ error: 'Keine Berechtigung.' }, { status: 403 });
  return NextResponse.json({ error: 'Die Anfrage konnte nicht verarbeitet werden.' }, { status: 500 });
}
export function getClientIp(request: NextRequest): string {
  const ip = process.env.TRUST_PROXY === 'true' ? request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'shared' : 'shared';
  return createHash('sha256').update(ip.slice(0, 100)).digest('hex');
}
export async function checkRateLimit(identifier: string, action: string, maxAttempts = 5, windowMs = 15 * 60 * 1000) {
  const db = getDb();
  const now = new Date();
  const resetAt = new Date(now.getTime() + windowMs);
  await db.delete(rateLimits).where(lt(rateLimits.resetAt, new Date(now.getTime() - 86400000)));
  const [row] = await db.insert(rateLimits).values({ identifier, action, count: 1, resetAt }).onConflictDoUpdate({
    target: [rateLimits.identifier, rateLimits.action],
    set: { count: sql`CASE WHEN ${rateLimits.resetAt} <= ${now.toISOString()}::timestamp THEN 1 ELSE ${rateLimits.count} + 1 END`, resetAt: sql`CASE WHEN ${rateLimits.resetAt} <= ${now.toISOString()}::timestamp THEN ${resetAt.toISOString()}::timestamp ELSE ${rateLimits.resetAt} END` },
  }).returning({ count: rateLimits.count });
  return row.count <= maxAttempts;
}
export function checkOrigin(request: NextRequest) {
  const expected = new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').origin;
  return request.headers.get('origin') === expected && request.headers.get('sec-fetch-site') !== 'cross-site';
}
export function assertOrigin(request: NextRequest) {
  if (!checkOrigin(request)) throw new HttpError(403, 'Unzulässiger Ursprung.');
}
export const validateFormOrigin = checkOrigin;
export async function readJson(request: NextRequest, maxBytes = 300000) {
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, 'Leere Anfrage.');
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > maxBytes) { await reader.cancel(); throw new HttpError(413, 'Die Anfrage ist zu groß.'); }
    chunks.push(value);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}
