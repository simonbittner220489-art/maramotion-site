import { getDb } from '@/db/client';
import { uploads } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function createUpload(data: typeof uploads.$inferInsert) {
  const db = getDb();
  return db.insert(uploads).values(data).returning();
}

export async function getUpload(id: string) {
  const db = getDb();
  const result = await db
    .select()
    .from(uploads)
    .where(eq(uploads.id, id))
    .limit(1);
  return result[0] || null;
}

export async function listUploads() {
  const db = getDb();
  return db.select().from(uploads).orderBy(uploads.createdAt);
}

export async function deleteUpload(id: string) {
  const db = getDb();
  return db.delete(uploads).where(eq(uploads.id, id)).returning();
}
