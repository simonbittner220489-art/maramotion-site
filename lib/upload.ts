import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import sharp, { type OutputInfo } from 'sharp';
import { fileTypeFromBuffer } from 'file-type';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { HttpError } from './security';
import { put } from '@vercel/blob';

export async function validateAndOptimizeImage(buffer: Buffer) {
  if (buffer.length > 5 * 1024 * 1024) throw new HttpError(413, 'Maximal 5 MB pro Bild.');
  const fileType = await fileTypeFromBuffer(buffer);
  if (!fileType || !['image/jpeg', 'image/png', 'image/webp'].includes(fileType.mime)) throw new HttpError(400, 'Nur JPEG, PNG und WebP sind erlaubt.');
  let output: { data: Buffer; info: OutputInfo };
  try { output = await sharp(buffer, { limitInputPixels: 40000000, animated: false }).rotate().resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true }).webp({ quality: 84 }).toBuffer({ resolveWithObject: true }); }
  catch { throw new HttpError(400, 'Das Bild konnte nicht gelesen werden.'); }
  const filename = `${randomUUID()}.webp`;
  let url: string;
  if (process.env.MEDIA_STORAGE === 's3') {
    if (!process.env.S3_BUCKET || !process.env.S3_PUBLIC_URL || !process.env.S3_ACCESS_KEY_ID || !process.env.S3_SECRET_ACCESS_KEY) throw new HttpError(503, 'Medienspeicher ist nicht konfiguriert.');
    const storage = new S3Client({ region: process.env.S3_REGION || 'auto', endpoint: process.env.S3_ENDPOINT || undefined, credentials: { accessKeyId: process.env.S3_ACCESS_KEY_ID, secretAccessKey: process.env.S3_SECRET_ACCESS_KEY } });
    await storage.send(new PutObjectCommand({ Bucket: process.env.S3_BUCKET, Key: filename, Body: output.data, ContentType: 'image/webp', CacheControl: 'public, max-age=31536000, immutable' }));
    url = `${process.env.S3_PUBLIC_URL.replace(/\/$/, '')}/${filename}`;
  } else if (process.env.BLOB_READ_WRITE_TOKEN) {
    await put(filename, output.data, { access: 'public', addRandomSuffix: false, contentType: 'image/webp', cacheControlMaxAge: 31536000 });
    url = `/api/media/file/${filename}`;
  } else {
    if (process.env.VERCEL) throw new HttpError(503, 'Für dieses Hosting ist ein Objektspeicher erforderlich.');
    await fs.mkdir(path.join('.data', 'uploads'), { recursive: true });
    await fs.writeFile(path.join('.data', 'uploads', filename), output.data, { flag: 'wx' });
    url = `/api/media/file/${filename}`;
  }
  return { filename, path: url, width: output.info.width, height: output.info.height, mimeType: 'image/webp', size: output.info.size };
}
