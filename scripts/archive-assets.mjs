import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

export const root = path.resolve('source/www.meinemara.de');
export async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return (await Promise.all(entries.map(e => e.isDirectory() ? walk(path.join(dir, e.name)) : path.join(dir, e.name)))).flat();
}
export async function migrateAssets() {
  const files = await walk(root);
  const groups = new Map();
  for (const file of files.filter(f => /\.(png|jpe?g|webp)$/i.test(f))) {
    const folder = path.dirname(file);
    groups.set(folder, [...(groups.get(folder) || []), file]);
  }
  await fs.mkdir('public/images', { recursive: true });
  await fs.mkdir('public/fonts', { recursive: true });
  const mapping = {};
  const media = [];
  await fs.mkdir('public/downloads', { recursive: true });
  for (const file of files.filter(f => /\.pdf$/i.test(f))) {
    const filename = path.basename(file);
    await fs.copyFile(file, `public/downloads/${filename}`);
    mapping[path.resolve(file)] = { src: `/downloads/${filename}` };
  }
  for (const [folder, candidates] of groups) {
    const measured = (await Promise.all(candidates.map(async file => {
      try { return { file, meta: await sharp(file).metadata() }; }
      catch { console.warn(`Non-image archive file skipped: ${path.relative(root, file)}`); return null; }
    }))).filter(Boolean);
    if (!measured.length) continue;
    measured.sort((a, b) => b.meta.width * b.meta.height - a.meta.width * a.meta.height);
    const { file, meta } = measured[0];
    const name = createHash('sha256').update(path.relative(root, folder)).digest('hex').slice(0, 12);
    const output = `public/images/${name}.webp`;
    await sharp(file).rotate().resize({ width: 1800, withoutEnlargement: true }).webp({ quality: 84 }).toFile(output);
    const image = await sharp(output).metadata();
    const info = { src: `/images/${name}.webp`, width: image.width, height: image.height, original: path.relative(root, file), size: (await fs.stat(output)).size };
    media.push(info);
    for (const candidate of candidates) mapping[path.resolve(candidate)] = info;
    const base = folder.match(/[/\\]u[/\\]([^/\\]+)/)?.[1];
    if (base && (!mapping[base] || meta.width > mapping[base].width)) mapping[base] = info;
  }
  for (const name of ['Nunito-latin_latin-ext-regular.woff2', 'Nunito-latin_latin-ext-800.woff2', 'Roboto-latin_latin-ext-regular.woff2']) {
    const file = files.find(f => path.basename(f) === name);
    if (!file) throw new Error(`Missing font: ${name}`);
    await fs.copyFile(file, `public/fonts/${name}`);
  }
  const favicon = files.find(f => /w32,h32/.test(f) && /\.png$/.test(f));
  if (favicon) await fs.copyFile(favicon, 'public/icon.png');
  function imageFor(src, htmlFile) {
    if (!src) return null;
    const raw = decodeURIComponent(src.split('?')[0]);
    const local = raw.startsWith('http') ? path.join(root, new URL(raw).pathname) : raw.startsWith('/') ? path.join(root, raw) : path.resolve(path.dirname(htmlFile), raw);
    return mapping[local] || mapping[raw.match(/\/u\/([^/]+)/)?.[1]] || null;
  }
  return { imageFor, media, files };
}
