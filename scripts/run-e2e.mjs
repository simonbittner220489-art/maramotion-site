import { execFileSync, spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { PGlite } from '@electric-sql/pglite';

const env = { ...process.env, DATABASE_URL: '', PGLITE_DATA_DIR: './.data/qa', NEXT_PUBLIC_SITE_URL: 'http://localhost:3001', E2E_ADMIN_EMAIL: 'qa-admin@example.invalid', E2E_ADMIN_PASSWORD: randomBytes(24).toString('hex') };
execFileSync(process.execPath, ['scripts/migrate.js'], { env, stdio: 'inherit' });
execFileSync(process.execPath, ['node_modules/tsx/dist/cli.mjs', 'scripts/seed.ts', '--refresh'], { env, stdio: 'inherit' });
const db = new PGlite(env.PGLITE_DATA_DIR);
await db.query('DELETE FROM rate_limits');
await db.query('DELETE FROM contacts');
await db.query('DELETE FROM uploads WHERE uploaded_by IS NOT NULL');
await db.query('DELETE FROM users');
await db.close();
execFileSync(process.execPath, ['node_modules/tsx/dist/cli.mjs', 'scripts/create-admin.ts'], { env: { ...env, ADMIN_EMAIL: env.E2E_ADMIN_EMAIL, ADMIN_PASSWORD: env.E2E_ADMIN_PASSWORD }, stdio: 'inherit' });
const result = spawnSync(process.execPath, ['node_modules/@playwright/test/cli.js', 'test'], { env, stdio: 'inherit' });
process.exitCode = result.status || 0;
