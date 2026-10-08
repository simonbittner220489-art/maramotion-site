import sharp from 'sharp';

const url = 'https://www.meinemara.de/wp-content/uploads/go-x/u/55df3622-0842-41c9-91d1-0e0c5eac364e/image.png';
const response = await fetch(url);
if (!response.ok) throw new Error(`Original artwork HTTP ${response.status}`);
const buffer = Buffer.from(await response.arrayBuffer());
const result = await sharp(buffer).resize({ width: 1800, withoutEnlargement: true }).webp({ quality: 90 }).toFile('public/images/mara-baby-und-erwachsen.webp');
console.log(`Restored original Mara artwork: ${result.width} × ${result.height}`);
