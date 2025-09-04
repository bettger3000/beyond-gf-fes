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

      // Serve CSS files
      if (url.pathname === '/styles.css' || url.pathname.endsWith('.css')) {
        const filename = url.pathname.substring(1); // Remove leading slash
        return await getStaticFile(filename, env, corsHeaders);
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
      category: shop.category ? JSON.parse(shop.category) : [],
      tags: shop.tags ? JSON.parse(shop.tags) : [],
      short: shop.short || '',
      concept: shop.concept || '',
      desc: shop.desc || '',
      targetCustomer: shop.targetCustomer || '',
      story: shop.story || '',
      recommendation: shop.recommendation || '',
      allergyInfo: shop.allergyInfo ? JSON.parse(shop.allergyInfo) : [],
      contamination: shop.contamination || '',
      menu: shop.menu ? JSON.parse(shop.menu) : [],
      address: shop.address || '',
      googleMaps: shop.googleMaps || '',
      links: shop.links ? JSON.parse(shop.links) : {},
      thumb: shop.thumb || '',
      photos: shop.photos ? JSON.parse(shop.photos) : []
    }));

    return new Response(JSON.stringify(shops), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Database error:', error);
    return new Response(JSON.stringify({ error: 'Database Error' }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
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
        shop.category ? JSON.stringify(shop.category) : null,
        shop.tags ? JSON.stringify(shop.tags) : null,
        shop.short,
        shop.concept,
        shop.desc,
        shop.targetCustomer,
        shop.story,
        shop.recommendation,
        shop.allergyInfo ? JSON.stringify(shop.allergyInfo) : null,
        shop.contamination,
        shop.menu ? JSON.stringify(shop.menu) : null,
        shop.address,
        shop.googleMaps,
        shop.links ? JSON.stringify(shop.links) : null,
        shop.thumb,
        shop.photos ? JSON.stringify(shop.photos) : null
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

    // Determine correct content type based on filename
    let contentType = object.httpMetadata?.contentType || 'image/jpeg';
    if (filename.endsWith('.svg')) {
      contentType = 'image/svg+xml';
    } else if (filename.endsWith('.png')) {
      contentType = 'image/png';
    } else if (filename.endsWith('.webp')) {
      contentType = 'image/webp';
    } else if (filename.endsWith('.jpeg') || filename.endsWith('.jpg')) {
      contentType = 'image/jpeg';
    }

    const headers = {
      ...corsHeaders,
      'Content-Type': contentType,
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
      imagePath: filename,
      url: `/api/image/${filename}`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Upload error:', error);
    return new Response('Upload Error', { status: 500, headers: corsHeaders });
  }
}

async function getStaticFile(filename, env, corsHeaders) {
  try {
    const object = await env.IMAGES.get(filename);
    if (!object) {
      return new Response('File not found', { status: 404, headers: corsHeaders });
    }

    let contentType = 'text/plain';
    if (filename.endsWith('.css')) {
      contentType = 'text/css';
    } else if (filename.endsWith('.js')) {
      contentType = 'application/javascript';
    } else if (filename.endsWith('.html')) {
      contentType = 'text/html';
    }

    const headers = {
      ...corsHeaders,
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400'
    };

    return new Response(object.body, { headers });
  } catch (error) {
    console.error('Static file error:', error);
    return new Response('File Error', { status: 500, headers: corsHeaders });
  }
}