// Remove photo paths from all shops to use logo only
const updatedShopsData = [
  { id: "s01", photos: [] },
  { id: "s02", photos: [] },
  { id: "s03", photos: [] },
  { id: "s04", photos: [] },
  { id: "s05", photos: [] },
  { id: "s06", photos: [] },
  { id: "s07", photos: [] },
  { id: "s08", photos: [] },
  { id: "s09", photos: [] },
  { id: "s10", photos: [] }
];

const fs = require('fs');

async function updatePhotos() {
  const response = await fetch('https://gf-fes-api.bettger1000.workers.dev/api/shops');
  const shops = await response.json();
  
  // Clear photos array for all shops
  const updatedShops = shops.map(shop => ({
    ...shop,
    photos: []
  }));
  
  // Send update
  const updateResponse = await fetch('https://gf-fes-api.bettger1000.workers.dev/api/shops', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedShops)
  });
  
  const result = await updateResponse.json();
  console.log('Update result:', result);
}

updatePhotos().catch(console.error);