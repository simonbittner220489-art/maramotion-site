import test from 'node:test';
import assert from 'node:assert/strict';
import { contactSchema, pageUpdateSchema } from '../lib/validation';
import { extractQuiz } from '../lib/quiz';
import { sanitizeHtml } from '../lib/sanitize';
import { readFile, access } from 'node:fs/promises';
import type { ImportedPage } from '../lib/types';

test('contact consent, name, email and bounds are validated', () => {
  assert.equal(contactSchema.safeParse({ name: 'Mara Fan', consentGdpr: true }).success, true);
  assert.equal(contactSchema.safeParse({ name: '', consentGdpr: true }).success, false);
  assert.equal(contactSchema.safeParse({ name: 'Mara Fan', consentGdpr: false }).success, false);
  assert.equal(contactSchema.safeParse({ name: 'Mara Fan', email: 'bad', consentGdpr: true }).success, false);
  assert.equal(contactSchema.safeParse({ name: 'Mara Fan', message: 'a'.repeat(5001), consentGdpr: true }).success, false);
});
test('unsafe HTML and image URLs are rejected', () => {
  assert.ok(!sanitizeHtml('<script>alert(1)</script><a href="javascript:alert(1)">x</a>').includes('javascript:'));
  assert.equal(pageUpdateSchema.safeParse({ blocks: [{ type: 'image', src: 'javascript:test.png' }] }).success, false);
  assert.equal(pageUpdateSchema.safeParse({ blocks: [{ type: 'image', src: '/images/abc.webp' }] }).success, true);
});
test('all imported pages and local media and PDFs are preserved', async () => {
  const pages: ImportedPage[] = JSON.parse(await readFile('db/seed-data/pages.json', 'utf8'));
  assert.equal(pages.length, 21);
  for (const page of pages) {
    assert.ok(page.blocks.length && page.content.length > 100, page.slug);
    assert.ok(!page.seoTitle?.includes('Cookie icon'), page.slug);
    for (const block of page.blocks) {
      if (block.src?.startsWith('/')) await access(`public${block.src}`);
      for (const match of (block.html || '').matchAll(/href="(\/downloads\/[^"#]+)"/g)) await access(`public${decodeURIComponent(match[1])}`);
    }
  }
  const questions = extractQuiz(pages.find(page => page.slug === 'jaguar')!.blocks);
  assert.ok(questions.length >= 2);
});
