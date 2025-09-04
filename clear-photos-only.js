// Clear photos arrays while keeping all other data intact
const fetch = require('node-fetch');

async function clearPhotosOnly() {
  try {
    console.log('Fetching current shop data...');
    const response = await fetch('https://gf-fes-api.bettger1000.workers.dev/api/shops');
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }
    
    const shops = await response.json();
    console.log(`Found ${shops.length} shops`);
    
    // Clear only the photos array, keep everything else unchanged
    const updatedShops = shops.map(shop => ({
      ...shop,
      photos: [] // Clear photos array only
    }));
    
    console.log('Updating shops with empty photos arrays...');
    const updateResponse = await fetch('https://gf-fes-api.bettger1000.workers.dev/api/shops', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedShops)
    });
    
    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      throw new Error(`Update failed: ${updateResponse.status} - ${errorText}`);
    }
    
    const result = await updateResponse.json();
    console.log('Success:', result);
    
    // Verify the update
    console.log('Verifying update...');
    const verifyResponse = await fetch('https://gf-fes-api.bettger1000.workers.dev/api/shops');
    const verifyData = await verifyResponse.json();
    const photosStatus = verifyData.map(shop => ({
      id: shop.id,
      name: shop.name,
      thumb: shop.thumb,
      photos_count: shop.photos.length
    }));
    
    console.log('Verification - Photos count per shop:');
    console.table(photosStatus);
    
    return true;
  } catch (error) {
    console.error('Error:', error.message);
    return false;
  }
}

// Run the function
clearPhotosOnly();