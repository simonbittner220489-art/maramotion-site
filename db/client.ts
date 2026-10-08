import { drizzle } from 'drizzle-orm/postgres-js';
import { drizzle as drizzleWasm } from 'drizzle-orm/pglite';
import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';
import postgres from 'postgres';
import { PGlite } from '@electric-sql/pglite';
import * as schema from './schema';

export type DB = PgDatabase<PgQueryResultHKT, typeof schema>;
const state = globalThis as typeof globalThis & {
  maraDb?: DB;
  maraClose?: () => Promise<void>;
};

export function getDb(): DB {
  if (state.maraDb) return state.maraDb;
  if (process.env.DATABASE_URL?.trim()) {
    const client = postgres(process.env.DATABASE_URL, { prepare: false, max: 5 });
    state.maraDb = drizzle(client, { schema });
    state.maraClose = () => client.end();
  } else {
    if (process.env.VERCEL) throw new Error('Hosted deployments require DATABASE_URL.');
    const client = new PGlite(process.env.PGLITE_DATA_DIR || './.data/pglite');
    state.maraDb = drizzleWasm(client, { schema });
    state.maraClose = () => client.close();
  }
  return state.maraDb;
}

export async function closeDb() {
  await state.maraClose?.();
  delete state.maraDb;
  delete state.maraClose;
}
