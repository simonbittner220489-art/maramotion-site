import 'dotenv/config';
import { stdin, stdout } from 'node:process';
import { createInterface } from 'node:readline/promises';
import { Writable } from 'node:stream';
import { getDb, closeDb } from '../db/client';
import { users } from '../db/schema';
import { hashPassword } from '../lib/auth';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

async function question(prompt: string, hidden = false) {
  if (!stdin.isTTY) throw new Error('Use an interactive terminal or inherited ADMIN_EMAIL and ADMIN_PASSWORD variables.');
  const output = hidden ? new Writable({ write(_chunk, _encoding, callback) { callback(); } }) : stdout;
  const rl = createInterface({ input: stdin, output, terminal: true });
  if (hidden) stdout.write(prompt);
  try { return await rl.question(hidden ? '' : prompt); }
  finally { rl.close(); if (hidden) stdout.write('\n'); }
}
async function main() {
  const email = z.email().parse((process.env.ADMIN_EMAIL || await question('Admin email: ')).trim().toLowerCase());
  const password = process.env.ADMIN_PASSWORD || await question('Password (hidden, min. 12 characters): ', true);
  if (password.length < 12 || Buffer.byteLength(password) > 72) throw new Error('Use at least 12 characters and at most 72 UTF-8 bytes.');
  if (!process.env.ADMIN_PASSWORD && password !== await question('Confirm password (hidden): ', true)) throw new Error('Passwords do not match.');
  const db = getDb();
  if ((await db.select({ id: users.id }).from(users).where(eq(users.email, email))).length) throw new Error('This account already exists.');
  await db.insert(users).values({ email, passwordHash: await hashPassword(password), name: 'Administrator', role: 'admin' });
  console.log('Administrator created. Sign in at /admin.');
}
main().catch(() => { console.error('Administrator was not created. Check the email, password requirements and database setup.'); process.exitCode = 1; }).finally(closeDb);
