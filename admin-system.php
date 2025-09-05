<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>🍞 店舗管理システム - 確実版</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: 'Hiragino Sans', 'Yu Gothic', Arial, sans-serif;
  background: linear-gradient(45deg, #FF6B6B, #4ECDC4, #45B7D1, #96CEB4);
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
  min-height: 100vh;
  padding: 20px;
}
@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
.container {
  max-width: 1600px;
  margin: 0 auto;
  background: rgba(255,255,255,0.95);
  border-radius: 25px;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(0,0,0,0.3);
  backdrop-filter: blur(10px);
}
.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 50px;
  text-align: center;
  position: relative;
  overflow: hidden;
}
.header::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  animation: shine 3s ease-in-out infinite;
}
@keyframes shine {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(180deg); }
}
.title {
  font-size: 48px;
  font-weight: bold;
  margin-bottom: 15px;
  text-shadow: 3px 3px 6px rgba(0,0,0,0.4);
  position: relative;
  z-index: 2;
}
.subtitle {
  font-size: 20px;
  opacity: 0.9;
  position: relative;
  z-index: 2;
}
.status {
  padding: 40px;
  text-align: center;
  border-bottom: 4px solid #f0f0f0;
}
.loading {
  background: linear-gradient(135deg, #FFD93D, #FF6B6B);
  color: #8B4513;
  padding: 30px;
  border-radius: 20px;
  font-size: 24px;
  font-weight: bold;
  box-shadow: 0 8px 20px rgba(255, 107, 107, 0.4);
  animation: pulse 2s infinite;
}
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
.success {
  background: linear-gradient(135deg, #84fab0, #8fd3f4);
  color: #2d5016;
  padding: 30px;
  border-radius: 20px;
  font-size: 26px;
  font-weight: bold;
  box-shadow: 0 8px 20px rgba(132, 250, 176, 0.4);
}
.error {
  background: linear-gradient(135deg, #ff9a9e, #fecfef);
  color: #8b0000;
  padding: 30px;
  border-radius: 20px;
  font-size: 24px;
  font-weight: bold;
  box-shadow: 0 8px 20px rgba(255, 154, 158, 0.4);
}
.shops {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(550px, 1fr));
  gap: 35px;
  padding: 50px;
}
.shop {
  background: linear-gradient(135deg, #ffffff, #f8f9fa);
  border: 4px solid transparent;
  border-radius: 25px;
  padding: 35px;
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 15px 35px rgba(0,0,0,0.1);
}
.shop::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 6px;
  background: linear-gradient(90deg, #FF6B6B, #4ECDC4, #45B7D1, #96CEB4);
  background-size: 300% 100%;
  animation: borderMove 3s linear infinite;
}
@keyframes borderMove {
  0% { background-position: 0% 50%; }
  100% { background-position: 100% 50%; }
}
.shop:hover {
  transform: translateY(-15px) rotateX(5deg);
  box-shadow: 0 25px 50px rgba(0,0,0,0.2);
  border-image: linear-gradient(45deg, #FF6B6B, #4ECDC4) 1;
}
.shop-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 3px solid #e9ecef;
}
.shop-name {
  font-size: 28px;
  font-weight: bold;
  color: #2c3e50;
  margin: 0;
  text-shadow: 1px 1px 3px rgba(0,0,0,0.1);
}
.shop-id {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 10px 20px;
  border-radius: 25px;
  font-size: 16px;
  font-weight: bold;
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}
.info {
  display: flex;
  align-items: flex-start;
  margin: 18px 0;
  font-size: 18px;
}
.emoji {
  margin-right: 15px;
  font-size: 24px;
  min-width: 40px;
  flex-shrink: 0;
}
.text {
  color: #34495e;
  line-height: 1.7;
  flex: 1;
}
.categories {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin: 20px 0;
}
.category {
  background: linear-gradient(135deg, #74b9ff, #0984e3);
  color: white;
  padding: 10px 18px;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 5px 15px rgba(116, 185, 255, 0.4);
  transition: transform 0.3s ease;
}
.category:hover {
  transform: scale(1.1);
}
.concept {
  background: linear-gradient(135deg, #a8edea, #fed6e3);
  padding: 25px;
  border-radius: 20px;
  margin: 25px 0;
  border-left: 6px solid #667eea;
  font-style: italic;
  color: #2c3e50;
  line-height: 1.8;
  font-size: 18px;
  box-shadow: 0 8px 20px rgba(168, 237, 234, 0.3);
}
.menu {
  margin-top: 30px;
  padding-top: 30px;
  border-top: 3px solid #e9ecef;
}
.menu-title {
  font-size: 20px;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 20px;
}
.menu-item {
  background: linear-gradient(135deg, #ffeaa7, #fab1a0);
  padding: 15px 20px;
  margin: 12px 0;
  border-radius: 15px;
  font-size: 16px;
  color: #2d3436;
  box-shadow: 0 5px 15px rgba(255, 234, 167, 0.4);
  transition: transform 0.3s ease;
}
.menu-item:hover {
  transform: translateX(10px);
}
.spinner {
  border: 6px solid #f3f3f3;
  border-top: 6px solid #667eea;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  display: inline-block;
  margin-right: 20px;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
@media (max-width: 768px) {
  .shops { grid-template-columns: 1fr; }
  .title { font-size: 32px; }
}
</style>
</head>
<body>

<div class="container">
  <div class="header">
    <h1 class="title">🍞 店舗管理システム【PHP版】</h1>
    <p class="subtitle">ビヨンドグルテンフリー祭り 2025 - 確実データ表示</p>
  </div>
  
  <div class="status">
    <div id="status" class="loading">
      <span class="spinner"></span>
      店舗データを確実に読み込み中...
    </div>
  </div>
  
  <div id="shops" class="shops"></div>
</div>

<script>
console.log('🚀 PHP版管理システム起動');
console.log('現在時刻:', new Date().toLocaleString('ja-JP'));

const statusEl = document.getElementById('status');
const shopsEl = document.getElementById('shops');
const API = 'https://gf-fes-api.bettger1000.workers.dev/api/shops';

console.log('🔗 API URL:', API);

loadData();

function loadData() {
  console.log('📡 データ読み込み開始...');
  
  const xhr = new XMLHttpRequest();
  xhr.open('GET', API, true);
  xhr.timeout = 20000;
  
  xhr.onload = function() {
    console.log('📊 レスポンス受信 - ステータス:', xhr.status);
    
    if (xhr.status === 200) {
      try {
        const data = JSON.parse(xhr.responseText);
        console.log('✅ 解析成功 - 店舗数:', data.length);
        console.log('📋 店舗リスト:', data.map(s => s.name));
        showShops(data);
      } catch (err) {
        console.error('❌ JSON解析失敗:', err);
        showError('データ解析エラー: ' + err.message);
      }
    } else {
      console.error('❌ HTTP エラー:', xhr.status);
      showError('HTTP エラー: ' + xhr.status);
    }
  };
  
  xhr.onerror = function() {
    console.error('❌ 通信エラー');
    showError('通信エラーが発生しました');
  };
  
  xhr.ontimeout = function() {
    console.error('❌ タイムアウト');
    showError('20秒でタイムアウトしました');
  };
  
  xhr.send();
}

function showShops(shops) {
  if (!Array.isArray(shops) || shops.length === 0) {
    showError('店舗データが空です');
    return;
  }
  
  console.log('🎨 UI構築開始...');
  
  statusEl.className = 'success';
  statusEl.innerHTML = '🎉 ' + shops.length + '店舗のデータを完全表示中！';
  
  let html = '';
  shops.forEach((shop, i) => {
    console.log(`🏪 店舗${i+1}: ${shop.name}`);
    html += buildShop(shop, i + 1);
  });
  
  shopsEl.innerHTML = html;
  console.log('✨ 表示完了！');
}

function buildShop(shop, num) {
  let card = '<div class="shop">';
  
  card += '<div class="shop-header">';
  card += '<h2 class="shop-name">' + escape(shop.name || `店舗${num}`) + '</h2>';
  card += '<span class="shop-id">' + escape(shop.id || `#${num}`) + '</span>';
  card += '</div>';
  
  if (shop.address) {
    card += '<div class="info">';
    card += '<span class="emoji">📍</span>';
    card += '<span class="text"><strong>住所:</strong> ' + escape(shop.address) + '</span>';
    card += '</div>';
  }
  
  if (shop.category?.length) {
    card += '<div class="info">';
    card += '<span class="emoji">🏷️</span>';
    card += '<div class="categories">';
    shop.category.forEach(cat => {
      card += '<span class="category">' + escape(cat) + '</span>';
    });
    card += '</div>';
    card += '</div>';
  }
  
  if (shop.targetCustomer) {
    card += '<div class="info">';
    card += '<span class="emoji">🎯</span>';
    card += '<span class="text"><strong>対象:</strong> ' + escape(shop.targetCustomer) + '</span>';
    card += '</div>';
  }
  
  if (shop.short) {
    card += '<div class="info">';
    card += '<span class="emoji">⭐</span>';
    card += '<span class="text"><strong>特徴:</strong> ' + escape(shop.short) + '</span>';
    card += '</div>';
  }
  
  if (shop.concept) {
    card += '<div class="concept">';
    card += '<strong>💭 コンセプト:</strong><br>' + escape(shop.concept);
    card += '</div>';
  }
  
  if (shop.menu?.length) {
    card += '<div class="menu">';
    card += '<div class="menu-title">🍽️ メニュー</div>';
    shop.menu.forEach(item => {
      card += '<div class="menu-item">';
      card += escape(item.name || '商品');
      if (item.price) card += ' - <strong>' + escape(item.price) + '</strong>';
      card += '</div>';
    });
    card += '</div>';
  }
  
  card += '</div>';
  return card;
}

function showError(msg) {
  statusEl.className = 'error';
  statusEl.innerHTML = '💥 ' + escape(msg);
  shopsEl.innerHTML = '';
}

function escape(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
</script>

</body>
</html>