export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // API Routes
      if (url.pathname === '/api/shops') {
        if (request.method === 'GET') {
          return await getShops(env, corsHeaders);
        } else if (request.method === 'POST') {
          return await updateShops(request, env, corsHeaders);
        }
      }

      if (url.pathname.startsWith('/api/image/')) {
        const filename = url.pathname.split('/api/image/')[1];
        return await getImage(filename, env, corsHeaders);
      }

      if (url.pathname === '/api/upload-image' && request.method === 'POST') {
        return await uploadImage(request, env, corsHeaders);
      }

      return new Response('Not Found', { status: 404, headers: corsHeaders });
    } catch (error) {
      console.error('Worker error:', error);
      return new Response('Internal Server Error', { 
        status: 500, 
        headers: corsHeaders 
      });
    }
  }
};

async function getShops(env, corsHeaders) {
  try {
    const result = await env.DB.prepare('SELECT * FROM shops').all();
    const shops = result.results.map(shop => ({
      id: shop.id,
      name: shop.name,
      category: shop.category ? JSON.parse(shop.category) : null,
      tags: shop.tags ? JSON.parse(shop.tags) : null,
      short: shop.short,
      concept: shop.concept,
      desc: shop.desc,
      targetCustomer: shop.targetCustomer,
      story: shop.story,
      recommendation: shop.recommendation,
      allergyInfo: shop.allergyInfo ? JSON.parse(shop.allergyInfo) : null,
      contamination: shop.contamination,
      menu: shop.menu ? JSON.parse(shop.menu) : null,
      address: shop.address,
      googleMaps: shop.googleMaps,
      links: shop.links ? JSON.parse(shop.links) : null,
      thumb: shop.thumb,
      photos: shop.photos ? JSON.parse(shop.photos) : null
    }));

    return new Response(JSON.stringify(shops), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Database error:', error);
    return new Response('Database Error', { status: 500, headers: corsHeaders });
  }
}

async function updateShops(request, env, corsHeaders) {
  try {
    const shops = await request.json();
    
    // Clear existing data
    await env.DB.prepare('DELETE FROM shops').run();
    
    // Insert new data
    for (const shop of shops) {
      await env.DB.prepare(`
        INSERT INTO shops (id, name, category, tags, short, concept, desc, targetCustomer, story, recommendation, allergyInfo, contamination, menu, address, googleMaps, links, thumb, photos)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        shop.id,
        shop.name,
        JSON.stringify(shop.category),
        JSON.stringify(shop.tags),
        shop.short,
        shop.concept,
        shop.desc,
        shop.targetCustomer,
        shop.story,
        shop.recommendation,
        JSON.stringify(shop.allergyInfo),
        shop.contamination,
        JSON.stringify(shop.menu),
        shop.address,
        shop.googleMaps,
        JSON.stringify(shop.links),
        shop.thumb,
        JSON.stringify(shop.photos)
      ).run();
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Update error:', error);
    return new Response('Update Error', { status: 500, headers: corsHeaders });
  }
}

async function getImage(filename, env, corsHeaders) {
  try {
    const object = await env.IMAGES.get(filename);
    if (!object) {
      return new Response('Image not found', { status: 404, headers: corsHeaders });
    }

    const headers = {
      ...corsHeaders,
      'Content-Type': object.httpMetadata?.contentType || 'image/jpeg',
      'Cache-Control': 'public, max-age=86400'
    };

    return new Response(object.body, { headers });
  } catch (error) {
    console.error('Image error:', error);
    return new Response('Image Error', { status: 500, headers: corsHeaders });
  }
}

async function uploadImage(request, env, corsHeaders) {
  try {
    const formData = await request.formData();
    const file = formData.get('image');
    
    if (!file) {
      return new Response('No file uploaded', { status: 400, headers: corsHeaders });
    }

    const filename = `${Date.now()}_${file.name}`;
    await env.IMAGES.put(filename, file.stream(), {
      httpMetadata: {
        contentType: file.type
      }
    });

    return new Response(JSON.stringify({ 
      filename,
      url: `/api/image/${filename}`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Upload error:', error);
    return new Response('Upload Error', { status: 500, headers: corsHeaders });
  }
}