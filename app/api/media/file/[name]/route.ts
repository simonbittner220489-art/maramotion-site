import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { get } from '@vercel/blob';

export async function GET(_: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  if (!/^[0-9a-f-]{36}\.webp$/.test(name)) return new NextResponse(null, { status: 404 });
  try {
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const file = await get(name, { access: 'public' });
      if (!file || file.statusCode !== 200) return new NextResponse(null, { status: 404 });
      return new NextResponse(file.stream, { headers: { 'Content-Type': 'image/webp', 'Cache-Control': 'public, max-age=31536000, immutable', 'X-Content-Type-Options': 'nosniff' } });
    }
    const file = await readFile(path.join('.data', 'uploads', name));
    return new NextResponse(new Uint8Array(file), { headers: { 'Content-Type': 'image/webp', 'Cache-Control': 'public, max-age=31536000, immutable', 'X-Content-Type-Options': 'nosniff' } });
  } catch { return new NextResponse(null, { status: 404 }); }
}
