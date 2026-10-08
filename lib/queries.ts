import { getDb } from '@/db/client';
import { pages } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function getPage(slug: string) {
  const db = getDb();
  const result = await db
    .select()
    .from(pages)
    .where(eq(pages.slug, slug))
    .limit(1);
  return result[0] || null;
}

export async function listPages() {
  const db = getDb();
  return db
    .select()
    .from(pages)
    .where(eq(pages.published, true))
    .orderBy(pages.order);
}

export async function getAllPages() {
  const db = getDb();
  return db
    .select()
    .from(pages)
    .orderBy(pages.order);
}

export async function updatePage(
  id: string,
  data: Partial<typeof pages.$inferInsert>
) {
  const db = getDb();
  return db
    .update(pages)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(pages.id, id))
    .returning();
}

export async function createPage(data: typeof pages.$inferInsert) {
  const db = getDb();
  return db.insert(pages).values(data).returning();
}

export async function deletePage(id: string) {
  const db = getDb();
  return db.delete(pages).where(eq(pages.id, id)).returning();
}
