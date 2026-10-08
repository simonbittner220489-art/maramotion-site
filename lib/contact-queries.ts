import { getDb } from '@/db/client';
import { contacts } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function createContact(data: typeof contacts.$inferInsert) {
  const db = getDb();
  return db.insert(contacts).values(data).returning();
}

export async function getContact(id: string) {
  const db = getDb();
  const result = await db
    .select()
    .from(contacts)
    .where(eq(contacts.id, id))
    .limit(1);
  return result[0] || null;
}

export async function listContacts() {
  const db = getDb();
  return db.select().from(contacts).orderBy(contacts.createdAt);
}

export async function updateContactStatus(id: string, status: string) {
  const db = getDb();
  return db
    .update(contacts)
    .set({ status })
    .where(eq(contacts.id, id))
    .returning();
}

export async function deleteContact(id: string) {
  const db = getDb();
  return db.delete(contacts).where(eq(contacts.id, id)).returning();
}
