# Mara Motion Site

A newly implemented German rainforest and children's-book website reconstructed from the supplied HTTrack archive. Next.js 16, React, TypeScript, Drizzle, PostgreSQL-compatible PGlite for local development, and PostgreSQL for hosted production.

## Included

- 21 source pages, including 12 animal profiles, books, rainforest information, educator resources, contact and legal pages.
- 39 optimized local image/crop variants, local Nunito/Roboto fonts, and 15 original PDF activities.
- Editorial layouts, cinematic rainforest hero, restrained scroll/image motion, responsive navigation and reduced-motion support.
- Contact persistence, secure admin sessions, content/SEO editor, media upload, contact inbox and navigation/footer settings.
- Original paths, index.html redirects, canonical/OpenGraph/Twitter metadata, structured data, sitemap and robots.
- No migrated advertising or analytics trackers.

## Requirements

Use Node.js 24 LTS and npm. This workspace includes portable Node at `tools/node-v24.21.0-win-x64`. On Windows, `mara.cmd` runs npm with that portable runtime: substitute `mara.cmd` for `npm` in the commands below. The tools folder is not committed.

## Installation

```bash
npm install
cp .env.example .env
npm run db:migrate
npm run db:seed
npm run admin:create
npm run dev
```

On PowerShell use `Copy-Item .env.example .env` instead of `cp`. Open http://localhost:3000 and http://localhost:3000/admin. Admin creation prompts locally for email and a hidden password, at least 12 characters and at most 72 UTF-8 bytes. No account or default password is seeded. Automated provisioning can supply inherited `ADMIN_EMAIL` and `ADMIN_PASSWORD`; never put passwords in commands or commit them.

## Database

An empty `DATABASE_URL` selects embedded PostgreSQL in `.data/pglite`. No separate server or Docker is needed locally. Stop the app before running migrations, seeding or admin provisioning against PGlite: one process must own its directory. Never share that directory between app instances. `PGLITE_DATA_DIR` can change its location.

For production, configure `DATABASE_URL` through your hosting secret store with a real PostgreSQL connection. The same Drizzle schema and checked-in SQL migrations apply. PostgreSQL providers such as Neon, Railway, Supabase or a managed/self-hosted server can be used. Configure TLS as required by the provider, backups, retention and least-privilege database access.

`npm run db:generate` generates a migration after schema edits. `npm run db:migrate` applies pending migrations. `npm run db:seed` imports missing content without overwriting CMS edits. An intentional `npm run db:seed -- --refresh` restores imported source content and overwrites those edits.

## Source migration

The original archive remains unchanged in `.abacusai/temp`; the extracted source stays in the non-public, ignored `source/` directory. `npm run import:content` parses the archive and regenerates `db/seed-data/pages.json`, media records and the migration audit. It preserves semantic text and links, removes legacy scripts/markup, optimizes images without destroying originals, and copies PDFs. Then run the seed with `--refresh` only when replacing current editorial content is intended.

Three source files named PNG could not be decoded and were excluded. Some original decorative background references were empty archive files; the replacement hero uses a valid archived rainforest image. The source mentions a Mara song but contains no playable audio/video asset or embed in its main content; its explanatory text is preserved. Hosted translation integrations are not enabled.

## Architecture

- `app/(site)`: all public pages and shared navigation/footer.
- `app/admin`: authenticated editorial interface, isolated from public motion.
- `app/api`: authentication, contact, pages, media and settings route handlers.
- `components`: public presentation, motion, forms, quiz and admin controls.
- `lib`: repository queries, validation, sanitization, sessions, upload and SMTP adapters.
- `db`: Drizzle schema, SQL migrations and real imported seed data.
- `scripts`: migration, import, admin setup and isolated browser-test runner.
- `tests`: validation/import tests and Playwright browser workflows.

## Environment variables

`.env.example` contains empty configuration fields, never real credentials.

- `DATABASE_URL`, `PGLITE_DATA_DIR`: database selection and local storage.
- `NEXT_PUBLIC_SITE_URL`: exact canonical origin; required for production metadata and same-origin write protection.
- `TRUST_PROXY`: leave false unless a trusted ingress overwrites forwarded IP headers. Otherwise rate limits deliberately share a conservative bucket.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`, `CONTACT_EMAIL`: optional SMTP notifications. Contact requests are stored even when mail is unavailable; delivery is not claimed when unconfigured.
- `MEDIA_STORAGE`: local by default, or `s3`.
- `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_PUBLIC_URL`: S3/R2-compatible object storage. Use the hosting secret store. The public base URL must be HTTPS.

## Admin and security

The `/admin` login uses bcrypt-12 and random expiring opaque sessions, hashed in the database, with HttpOnly/SameSite cookies. HTTPS origins receive Secure cookies. Writes require the configured Origin. Input validation, HTML sanitization, body-size limits and database-backed login/contact rate limits are enforced.

Admins manage pages, media, incoming requests and settings. Editors can manage pages/media, not contact data or settings. Image uploads accept JPEG/PNG/WebP only, check file signatures and pixel/file limits, remove metadata, re-encode to WebP and persist the actual file. Local files are served through a constrained filename route under `/api/media/file/`.

The browser inbox shows stored messages; it is not an external email inbox. Status changes and permanent deletion are available. Protect production backups and delete personal data when no longer needed. No children’s personal data is seeded.

The final production-dependency audit reports no known vulnerabilities. Four moderate development-only audit entries remain in drizzle-kit's transitive esbuild tooling; do not expose development/studio servers publicly. npm's suggested forced downgrade was not applied because it would replace the migration tool with an incompatible older release.

## Checks

```bash
npm run lint
npm run type-check
npm test
npm run build
npm run test:e2e
```

Install the browser once with `npx playwright install chromium`. Browser tests run the production build on port 3001 using `.data/qa`, separate from the actual site database, and ephemeral test credentials. They cover original pages, nine requested viewport sizes, internal links/PDFs, mobile navigation, quiz/search, reduced motion, contact-to-admin flow, SEO edits, image upload, logout, authorization and axe accessibility checks. No traces containing login credentials are recorded.

Verified locally on 2026-09-17: production build and TypeScript, lint, three unit tests and four browser workflows passed. All 21 imported routes were checked at all nine requested viewport sizes. The final homepage Lighthouse audits scored Performance 99 desktop / 92 mobile, with Accessibility, Best Practices and SEO at 100 on both. Raw local audit output is in `.data/lighthouse-desktop.json` and `.data/lighthouse-mobile.json`. These are laboratory homepage results, not deployed field Core Web Vitals or a guarantee of complete accessibility.

## Production build and deployment

Run `npm run build` followed by `npm start`. The repository is compatible with a Node host or Vercel. For Vercel, configure real PostgreSQL and S3/R2 storage; persistent local database/uploads are explicitly rejected there. Run migrations and seed as controlled deployment tasks, not on every request. Provision the owner locally against the configured production database or through a secure administrative runner. Set the public HTTPS origin, configure optional email, apply retention/backups and smoke-test the deployed site.

No production service was connected or deployment performed by this build. The legal text is migrated from the old site and contains historical hosting/statistics statements. The site displays a clarification; the operator must review current hosting, mail processors, legal details and asset/font rights before public launch. Live Core Web Vitals and external SMTP/S3/PostgreSQL delivery require deployment-specific verification.
