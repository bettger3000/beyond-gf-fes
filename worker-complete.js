// 完全版Cloudflare Workers API - 全CRUD操作対応
export default {
  async fetch(request, env, ctx) {
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // OPTIONS request (preflight)
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // Sample data with IDs
    const shopsData = [
      {
        "id": "s01",
        "name": "とまり來",
        "category": ["スイーツ", "ドリンク"],
        "tags": ["小麦不使用", "ナッツ不使用", "専用調理場"],
        "short": "米粉ケーキとスペシャリティコーヒーの専門店",
        "concept": "『からだにやさしい』『こころにあたたかい』食を通じて集う場所",
        "desc": "米粉はもちろん、抹茶、クーベルチュールチョコ、スペシャリティコーヒー豆等、一つ一つの素材にこだわり『からだにやさしい』ケーキをご提供いたします。",
        "targetCustomer": "ご自分を大切にしたい方、身体やこころに優しいお食事がおこのみの方、家族やご友人と健康で豊かな食生活をお望みの方",
        "story": "自身がアレルギー疾患があり、第一子の流産を機に食生活と身体の健康について、人に良いと書いて『食』と学ぶ。現在は、【食】の学びを大切に子育てをし、『夢を叶える子育て』をモットーに大学生3年生と1年生の母親でもあります。子育てを経た2023年12月【食】への学びを活かして『とまり來』をオープン。2025年1月自身が、小麦粉＆ナッツ類のアナフィラキシーショックを発症し『とまり來』も順次グルテンフリーを対応。2025年9月メニューより、グルテンフリー対応する。",
        "recommendation": "小麦粉を気にせずに、安心して食べれるケーキです。アレルギーの方だけでなく、食べ物へのこだわりのある方、ご興味のある方はぜひ召し上がって下さい。",
        "allergyInfo": ["ナッツ類"],
        "contamination": "① 専用調理場・小麦・麦類を一切持ち込まない専用の調理場で製造",
        "menu": [
          {"name": "米粉ケーキ（豆まっちゃチーズ、おとうふショコラちゃん、ふんわりシフォン）", "price": ""},
          {"name": "スペシャリティコーヒー", "price": ""}
        ],
        "address": "豊明市沓掛町",
        "googleMaps": "",
        "links": {
          "instagram": "https://instagram.com/tomarigi_tyak"
        },
        "thumb": "",
        "photos": []
      },
      {
        "id": "s02",
        "name": "どらカフェ三幸",
        "category": ["和菓子"],
        "tags": ["小麦不使用", "専用調理場"],
        "short": "グルテンフリーのふわもちどらやき専門店",
        "concept": "",
        "desc": "",
        "targetCustomer": "",
        "story": "",
        "recommendation": "",
        "allergyInfo": [],
        "contamination": "",
        "menu": [],
        "address": "愛知県小牧市",
        "googleMaps": "",
        "links": {},
        "thumb": "",
        "photos": []
      }
    ];

    try {
      // GET /api/shops - 全店舗取得
      if (path === '/api/shops' && request.method === 'GET') {
        return new Response(JSON.stringify(shopsData), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // GET /api/shops/{id} - 個別店舗取得
      if (path.match(/^\/api\/shops\/[^\/]+$/) && request.method === 'GET') {
        const id = path.split('/').pop();
        const shop = shopsData.find(s => s.id === id);
        
        if (!shop) {
          return new Response('Shop not found', { 
            status: 404, 
            headers: corsHeaders 
          });
        }
        
        return new Response(JSON.stringify(shop), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // PUT /api/shops/{id} - 店舗更新
      if (path.match(/^\/api\/shops\/[^\/]+$/) && request.method === 'PUT') {
        const id = path.split('/').pop();
        const shopIndex = shopsData.findIndex(s => s.id === id);
        
        if (shopIndex === -1) {
          return new Response('Shop not found', { 
            status: 404, 
            headers: corsHeaders 
          });
        }

        const updateData = await request.json();
        
        // 更新（IDは保持）
        shopsData[shopIndex] = {
          ...shopsData[shopIndex],
          ...updateData,
          id: id // IDは変更不可
        };

        return new Response(JSON.stringify(shopsData[shopIndex]), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // POST /api/shops - 新規店舗作成
      if (path === '/api/shops' && request.method === 'POST') {
        const newShop = await request.json();
        
        // 新しいIDを生成
        const newId = 's' + String(shopsData.length + 1).padStart(2, '0');
        const shop = {
          id: newId,
          name: '',
          category: [],
          tags: [],
          short: '',
          concept: '',
          desc: '',
          targetCustomer: '',
          story: '',
          recommendation: '',
          allergyInfo: [],
          contamination: '',
          menu: [],
          address: '',
          googleMaps: '',
          links: {},
          thumb: '',
          photos: [],
          ...newShop
        };

        shopsData.push(shop);

        return new Response(JSON.stringify(shop), {
          status: 201,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // DELETE /api/shops/{id} - 店舗削除
      if (path.match(/^\/api\/shops\/[^\/]+$/) && request.method === 'DELETE') {
        const id = path.split('/').pop();
        const shopIndex = shopsData.findIndex(s => s.id === id);
        
        if (shopIndex === -1) {
          return new Response('Shop not found', { 
            status: 404, 
            headers: corsHeaders 
          });
        }

        const deletedShop = shopsData.splice(shopIndex, 1)[0];

        return new Response(JSON.stringify(deletedShop), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // API情報
      if (path === '/api' && request.method === 'GET') {
        return new Response(JSON.stringify({
          message: '完全版グルテンフリー祭りAPI',
          version: '2.0',
          endpoints: {
            'GET /api/shops': '全店舗取得',
            'GET /api/shops/{id}': '個別店舗取得',
            'POST /api/shops': '新規店舗作成',
            'PUT /api/shops/{id}': '店舗更新',
            'DELETE /api/shops/{id}': '店舗削除'
          },
          total_shops: shopsData.length
        }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // 404 Not Found
      return new Response('Not Found', { 
        status: 404, 
        headers: corsHeaders 
      });

    } catch (error) {
      return new Response('Internal Server Error: ' + error.message, { 
        status: 500, 
        headers: corsHeaders 
      });
    }
  }
};