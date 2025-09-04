// Split shops.json into smaller chunks for API upload
const fs = require('fs');

// Read original shops.json
const shops = JSON.parse(fs.readFileSync('./shops.json', 'utf8'));

// Fix image paths - remove assets/shops/ prefix
const fixedShops = shops.map(shop => ({
  ...shop,
  thumb: shop.thumb ? shop.thumb.replace('assets/shops/', '') : '',
  photos: shop.photos ? shop.photos.map(photo => photo.replace('assets/shops/', '')) : []
}));

// Split into chunks of 3 shops each
const chunkSize = 3;
const chunks = [];
for (let i = 0; i < fixedShops.length; i += chunkSize) {
  chunks.push(fixedShops.slice(i, i + chunkSize));
}

// Save each chunk
chunks.forEach((chunk, index) => {
  fs.writeFileSync(`./shops-chunk-${index + 1}.json`, JSON.stringify(chunk, null, 2));
  console.log(`Created shops-chunk-${index + 1}.json with ${chunk.length} shops`);
});

console.log(`Total chunks created: ${chunks.length}`);
console.log(`Total shops: ${fixedShops.length}`);