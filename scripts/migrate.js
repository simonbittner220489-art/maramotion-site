const { drizzle: drizzlePg } = require('drizzle-orm/postgres-js');
const { migrate: migratePg } = require('drizzle-orm/postgres-js/migrator');
const { drizzle: drizzleWasm } = require('drizzle-orm/pglite');
const { migrate: migrateWasm } = require('drizzle-orm/pglite/migrator');
const postgres = require('postgres');
const { PGlite } = require('@electric-sql/pglite');
const path = require('path');
require('dotenv').config();

const DATABASE_URL = process.env.DATABASE_URL?.trim();

async function runMigrations() {
  let db, sql;

  try {
    if (DATABASE_URL && DATABASE_URL.length > 0) {
      console.log('Using PostgreSQL driver');
      sql = postgres(DATABASE_URL, { max: 1 });
      db = drizzlePg(sql);
      console.log('Running migrations...');
      await migratePg(db, { migrationsFolder: path.join(__dirname, '..', 'db', 'migrations') });
      await sql.end();
    } else {
      console.log('Using PGlite driver');
      const dataDir = process.env.PGLITE_DATA_DIR || './.data/pglite';
      const pglite = new PGlite(dataDir);
      await pglite.waitReady;
      db = drizzleWasm(pglite);
      console.log('Running migrations...');
      await migrateWasm(db, { migrationsFolder: path.join(__dirname, '..', 'db', 'migrations') });
    }

    console.log('Migrations completed');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    if (sql) await sql.end();
    process.exit(1);
  }
}

runMigrations();
