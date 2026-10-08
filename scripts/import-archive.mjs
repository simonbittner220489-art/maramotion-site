import fs from 'node:fs/promises';
import path from 'node:path';
import { load } from 'cheerio';
import sanitize from 'sanitize-html';
import { root, migrateAssets } from './archive-assets.mjs';

const { imageFor, media, files } = await migrateAssets();
const pages = [];
const audit = [];
const cleanText = value => value.replace(/\s+/g, ' ').trim();
const animals = ['diskusbuntbarsch', 'faultier', 'gelbbrustara', 'gruene-anakonda', 'harpyie', 'jaguar', 'kapuzineraffe', 'kolibri', 'libelle', 'mata-mata', 'pfeilgiftfrosch', 'tukan'];
function linkFor(href, file) {
  if (!href || /^(javascript|data):/i.test(href)) return '';
  const base = `https://www.meinemara.de/${path.relative(root, file).replaceAll('\\', '/')}`;
  const url = new URL(href, base);
  if (url.hostname === 'www.meinemara.de' || url.hostname === 'meinemara.de') {
    if (url.pathname.includes('wp-content')) return imageFor(href, file)?.src || url.href;
    return url.pathname.replace(/index\.html$/, '').replace(/\/$/, '') || '/';
  }
  return url.href;
}
for (const file of files.filter(f => path.basename(f) === 'index.html' && !path.relative(root, f).includes('wp-'))) {
  const relative = path.relative(root, file).replaceAll('\\', '/');
  if (relative.split('/').length > 2) continue;
  const $ = load(await fs.readFile(file, 'utf8'));
  const zones = $('[data-zone-type="content"]');
  if (!zones.length) continue;
  const slug = relative === 'index.html' ? 'home' : relative.split('/')[0];
  const blocks = [];
  const scope = zones.clone();
  scope.find('script,style,form,iframe,noscript').remove();
  const expected = [];
  scope.find('h1,h2,h3,h4,h5,h6,p,li,img,a').each((_, el) => {
    const node = $(el);
    const tag = el.tagName;
    if (node.parents('p,li,h1,h2,h3,h4,h5,h6').length) return;
    if (tag === 'img') {
      const image = imageFor(node.attr('src'), file);
      if (!image) throw new Error(`Unmapped image in ${slug}`);
      blocks.push({ type: 'image', ...image, alt: node.attr('alt') || '' });
      return;
    }
    const text = cleanText(node.text());
    if (!text) return;
    expected.push(text);
    node.find('a').each((_, a) => {
      const anchor = $(a);
      const href = anchor.attr('href');
      anchor.attr('href', href === 'mailto:email@example.com' && anchor.text().includes('@') ? `mailto:${anchor.text().trim()}` : linkFor(href, file));
    });
    if (tag === 'a') {
      const href = linkFor(node.attr('href'), file);
      if (href && href !== '#') blocks.push({ type: 'link', content: text, href });
      return;
    }
    const html = sanitize(node.html() || '', { allowedTags: ['strong', 'b', 'em', 'i', 'a', 'br', 'sup', 'sub'], allowedAttributes: { a: ['href', 'title'] }, allowedSchemes: ['https', 'http', 'mailto', 'tel'], allowProtocolRelative: false });
    blocks.push({ type: /^h/.test(tag) ? 'heading' : tag === 'li' ? 'list-item' : 'paragraph', content: text, html, ...(/^h/.test(tag) ? { level: Number(tag[1]) } : {}) });
  });
  const h1 = blocks.find(b => b.type === 'heading' && b.level === 1);
  const seoTitle = $('head > title').first().text().trim();
  const seoDescription = $('meta[name="description"]').attr('content') || '';
  const headingText = h1?.html ? cleanText(load(h1.html.replace(/<br\s*\/?\s*>/gi, '\n')).text().split('\n')[0]) : h1?.content;
  const title = slug === 'home' ? 'Maras Regenwaldwelt' : headingText || seoTitle.split('|')[0].trim();
  const content = blocks.map(b => b.content || '').filter(Boolean).join('\n\n');
  const missing = expected.filter(text => !content.includes(text));
  if (missing.length) throw new Error(`Missing ${missing.length} text blocks in ${slug}`);
  pages.push({ slug, title, excerpt: seoDescription, content, blocks, seoTitle, seoDescription, canonicalUrl: `https://www.meinemara.de/${slug === 'home' ? '' : slug + '/'}`, published: true, order: pages.length, kind: animals.includes(slug) ? 'animal' : 'page' });
  audit.push({ slug, blocks: blocks.length, textCharacters: content.length, missingTextBlocks: missing.length, images: blocks.filter(b => b.type === 'image').length });
}
await fs.mkdir('db/seed-data', { recursive: true });
await fs.writeFile('db/seed-data/pages.json', JSON.stringify(pages, null, 2));
await fs.writeFile('db/seed-data/media.json', JSON.stringify(media, null, 2));
await fs.writeFile('db/seed-data/migration-audit.json', JSON.stringify({ pageCount: pages.length, mediaCount: media.length, audit }, null, 2));
console.table(audit);
console.log(`Imported ${pages.length} complete pages and ${media.length} optimized images.`);
