// Use POST API to restore all shop data
const fetch = require('node-fetch');
const fs = require('fs');

// Read original shops.json
const originalShops = JSON.parse(fs.readFileSync('./shops.json', 'utf8'));

// Fix image paths - remove assets/shops/ prefix
const fixedShops = originalShops.map(shop => ({
  ...shop,
  thumb: shop.thumb ? shop.thumb.replace('assets/shops/', '') : '',
  photos: shop.photos ? shop.photos.map(photo => photo.replace('assets/shops/', '')) : []
}));

console.log('Restored shop data with fixed image paths:');
console.log(`Total shops: ${fixedShops.length}`);

// Send to API
fetch('https://gf-fes-api.bettger1000.workers.dev/api/shops', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(fixedShops)
})
.then(response => response.json())
.then(data => {
  console.log('API Response:', data);
})
.catch(error => {
  console.error('Error:', error);
});