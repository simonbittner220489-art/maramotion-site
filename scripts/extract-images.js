const fs = require('fs');
const path = require('path');

const pagesFile = path.join(__dirname, '..', 'db', 'seed-data', 'pages.json');
const pages = JSON.parse(fs.readFileSync(pagesFile, 'utf8'));

const imageMap = {};
const imageList = [];

pages.forEach((page) => {
  if (!page.blocks) return;

  page.blocks.forEach((block) => {
    if (block.type === 'image' && block.src) {
      const src = block.src;
      if (!imageMap[src]) {
        imageMap[src] = {
          original_url: `https://www.meinemara.de/${src}`,
          alt: block.alt || '',
          referenced_by: [],
        };
        imageList.push(src);
      }
      imageMap[src].referenced_by.push(page.slug);
    }
  });
});

console.log(`Total unique images: ${Object.keys(imageMap).length}`);
console.log(`Referenced by ${Object.keys(imageMap).reduce((sum, k) => sum + imageMap[k].referenced_by.length, 0)} blocks`);

const outputPath = path.join(__dirname, '..', 'db', 'seed-data', 'image-mapping.json');
fs.writeFileSync(outputPath, JSON.stringify(imageMap, null, 2));
console.log(`\nImage mapping saved to: ${outputPath}`);

console.log('\nImage sources:');
Object.keys(imageMap).slice(0, 10).forEach(src => {
  console.log(`  ${src}`);
  console.log(`    Referenced in: ${imageMap[src].referenced_by.join(', ')}`);
});
