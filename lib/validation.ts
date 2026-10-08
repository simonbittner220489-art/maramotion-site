import { z } from 'zod';
import { sanitizeHtml } from './sanitize';

const safeUrl = z.string().max(2000).refine(value => /^(\/(?!\/)|https:\/\/|mailto:|tel:|#)/.test(value), 'Ungültiger Link');
const imageUrl = z.string().max(1000).refine(value => /^\/(images|api\/media\/file)\/[a-zA-Z0-9-]+\.(webp|png|jpg|jpeg)$/.test(value) || Boolean(process.env.S3_PUBLIC_URL && value.startsWith(`${process.env.S3_PUBLIC_URL.replace(/\/$/, '')}/`)), 'Ungültiger Bildpfad');
export const blockSchema = z.object({
  type: z.enum(['heading', 'paragraph', 'image', 'list-item', 'list', 'quiz', 'download', 'link', 'embed']),
  content: z.string().max(40000).optional(),
  html: z.string().max(80000).transform(value => sanitizeHtml(value)).optional(),
  level: z.number().int().min(1).max(6).optional(),
  items: z.array(z.string().max(3000)).max(100).optional(),
  src: imageUrl.optional(),
  href: safeUrl.optional(),
  alt: z.string().max(300).optional(),
  width: z.number().int().min(1).max(10000).optional(),
  height: z.number().int().min(1).max(10000).optional(),
});
export const pageUpdateSchema = z.object({
  title: z.string().trim().min(1).max(500).optional(),
  excerpt: z.string().max(1000).optional(),
  blocks: z.array(blockSchema).max(400).optional(),
  seoTitle: z.string().max(200).optional(),
  seoDescription: z.string().max(500).optional(),
  published: z.boolean().optional(),
}).strict();
export const pageCreateSchema = pageUpdateSchema.extend({ slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(120).refine(value => !['api', 'admin', 'home'].includes(value)), title: z.string().trim().min(1).max(500) });
export const contactSchema = z.object({
  name: z.string().trim().min(2).max(200),
  email: z.union([z.email().max(254), z.literal('')]).default(''),
  message: z.string().trim().max(5000).default(''),
  consentGdpr: z.literal(true),
  honeypot: z.string().max(200).default(''),
});
