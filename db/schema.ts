import { pgTable, text, timestamp, boolean, integer, jsonb, uuid, uniqueIndex } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  name: text('name'),
  role: text('role').default('editor'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: text('token_hash').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const pages = pgTable('pages', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').unique().notNull(),
  title: text('title').notNull(),
  excerpt: text('excerpt'),
  content: text('content'),
  blocks: jsonb('blocks').default([]),
  seoTitle: text('seo_title'),
  seoDescription: text('seo_description'),
  canonicalUrl: text('canonical_url'),
  published: boolean('published').default(false),
  order: integer('order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const uploads = pgTable('uploads', {
  id: uuid('id').primaryKey().defaultRandom(),
  filename: text('filename').notNull(),
  originalName: text('original_name'),
  mimeType: text('mime_type').notNull(),
  size: integer('size').notNull(),
  path: text('path').notNull(),
  s3Key: text('s3_key'),
  width: integer('width'),
  height: integer('height'),
  uploadedBy: uuid('uploaded_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
});

export const rateLimits = pgTable('rate_limits', {
  id: uuid('id').primaryKey().defaultRandom(),
  identifier: text('identifier').notNull(),
  action: text('action').notNull(),
  count: integer('count').default(1).notNull(),
  resetAt: timestamp('reset_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
}, table => [uniqueIndex('rate_limit_identity').on(table.identifier, table.action)]);

export const contacts = pgTable('contacts', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name'),
  email: text('email').notNull(),
  message: text('message').notNull(),
  consentGdpr: boolean('consent_gdpr').notNull().default(false),
  status: text('status').default('new'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const siteSettings = pgTable('site_settings', {
  key: text('key').primaryKey(),
  value: jsonb('value'),
  updatedAt: timestamp('updated_at').defaultNow(),
});
