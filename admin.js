// 管理画面用JavaScript
// このファイルをindex.htmlから読み込んで、URLパラメータで管理画面を表示

(function() {
  // URLパラメータをチェック
  const urlParams = new URLSearchParams(window.location.search);
  const isAdmin = urlParams.get('admin') === 'true' || window.location.hash === '#admin';
  
  if (!isAdmin) return;
  
  // 既存のコンテンツを管理画面で置き換え
  document.body.innerHTML = `
    <div style="max-width:1600px;margin:0 auto;background:white;border-radius:20px;overflow:hidden;box-shadow:0 20px 40px rgba(0,0,0,0.3);margin:20px;">
      <div style="background:linear-gradient(135deg,#2c5f2d 0%,#4a7c59 100%);color:white;padding:40px;text-align:center;">
        <h1 style="font-size:36px;font-weight:bold;margin:0 0 10px 0;">🍞 店舗管理システム</h1>
        <p style="font-size:18px;opacity:0.9;margin:0;">ビヨンドグルテンフリー祭り 2025 - 登録・編集・削除</p>
      </div>
      
      <div style="padding:20px;border-bottom:2px solid #eee;">
        <div style="display:flex;justify-content:center;gap:15px;flex-wrap:wrap;">
          <button onclick="showSection('list')" id="btn-list" style="background:#2c5f2d;color:white;border:none;padding:12px 24px;border-radius:25px;font-size:16px;cursor:pointer;font-weight:bold;">📋 店舗一覧</button>
          <button onclick="showSection('add')" id="btn-add" style="background:#4a90e2;color:white;border:none;padding:12px 24px;border-radius:25px;font-size:16px;cursor:pointer;font-weight:bold;">🆕 新規登録</button>
          <button onclick="exportData()" style="background:#e74c3c;color:white;border:none;padding:12px 24px;border-radius:25px;font-size:16px;cursor:pointer;font-weight:bold;">💾 データ出力</button>
        </div>
      </div>
      
      <div id="section-list" style="display:block;">
        <div style="padding:30px;text-align:center;">
          <div id="status" style="background:linear-gradient(135deg,#ffecd2 0%,#fcb69f 100%);color:#d2691e;padding:20px;border-radius:15px;font-size:18px;font-weight:bold;margin-bottom:30px;">
            店舗データを読み込んでいます...
          </div>
        </div>
        <div id="shops-list" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(400px,1fr));gap:25px;padding:0 30px 30px;"></div>
      </div>
      
      <div id="section-add" style="display:none;padding:40px;">
        <h2 style="color:#2c5f2d;text-align:center;margin-bottom:30px;font-size:28px;">🆕 新規店舗登録</h2>
        <form id="shop-form" style="max-width:800px;margin:0 auto;">
          <div style="display:grid;gap:20px;">
            <div>
              <label style="display:block;font-weight:bold;margin-bottom:8px;color:#333;">店舗名 *</label>
              <input type="text" id="shop-name" required style="width:100%;padding:12px;border:2px solid #ddd;border-radius:8px;font-size:16px;">
            </div>
            
            <div>
              <label style="display:block;font-weight:bold;margin-bottom:8px;color:#333;">住所</label>
              <input type="text" id="shop-address" style="width:100%;padding:12px;border:2px solid #ddd;border-radius:8px;font-size:16px;">
            </div>
            
            <div>
              <label style="display:block;font-weight:bold;margin-bottom:8px;color:#333;">カテゴリ（複数選択可）</label>
              <div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:10px;">
                <label><input type="checkbox" value="スイーツ"> スイーツ</label>
                <label><input type="checkbox" value="食事"> 食事</label>
                <label><input type="checkbox" value="パン"> パン</label>
                <label><input type="checkbox" value="ドリンク"> ドリンク</label>
              </div>
            </div>
            
            <div>
              <label style="display:block;font-weight:bold;margin-bottom:8px;color:#333;">特徴・タグ（複数選択可）</label>
              <div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:10px;">
                <label><input type="checkbox" value="小麦不使用"> 小麦不使用</label>
                <label><input type="checkbox" value="卵不使用"> 卵不使用</label>
                <label><input type="checkbox" value="乳不使用"> 乳不使用</label>
                <label><input type="checkbox" value="ナッツ不使用"> ナッツ不使用</label>
              </div>
            </div>
            
            <div>
              <label style="display:block;font-weight:bold;margin-bottom:8px;color:#333;">簡潔な説明</label>
              <input type="text" id="shop-short" style="width:100%;padding:12px;border:2px solid #ddd;border-radius:8px;font-size:16px;">
            </div>
            
            <div>
              <label style="display:block;font-weight:bold;margin-bottom:8px;color:#333;">コンセプト</label>
              <textarea id="shop-concept" rows="4" style="width:100%;padding:12px;border:2px solid #ddd;border-radius:8px;font-size:16px;resize:vertical;"></textarea>
            </div>
            
            <div style="text-align:center;margin-top:30px;">
              <button type="submit" style="background:linear-gradient(135deg,#2c5f2d,#4a7c59);color:white;border:none;padding:15px 40px;border-radius:25px;font-size:18px;font-weight:bold;cursor:pointer;">💾 店舗を登録</button>
              <button type="button" onclick="resetForm()" style="background:#6c757d;color:white;border:none;padding:15px 40px;border-radius:25px;font-size:18px;font-weight:bold;cursor:pointer;margin-left:15px;">🔄 リセット</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  `;
  
  // 管理画面の機能を実装
  window.API_BASE = 'https://gf-fes-api.bettger1000.workers.dev/api';
  window.shops = [];
  
  window.showSection = function(section) {
    document.getElementById('section-list').style.display = section === 'list' ? 'block' : 'none';
    document.getElementById('section-add').style.display = section === 'add' ? 'block' : 'none';
    
    document.getElementById('btn-list').style.background = section === 'list' ? '#2c5f2d' : '#6c757d';
    document.getElementById('btn-add').style.background = section === 'add' ? '#4a90e2' : '#6c757d';
    
    if (section === 'list') loadShops();
  };
  
  window.loadShops = function() {
    console.log('📡 店舗一覧取得開始');
    const statusDiv = document.getElementById('status');
    
    const xhr = new XMLHttpRequest();
    xhr.open('GET', API_BASE + '/shops', true);
    xhr.timeout = 20000;
    
    xhr.onload = function() {
      if (xhr.status === 200) {
        try {
          shops = JSON.parse(xhr.responseText);
          console.log('✅ 店舗取得成功:', shops.length + '件');
          displayShops();
        } catch (e) {
          console.error('❌ JSON解析エラー:', e);
          statusDiv.innerHTML = '❌ データ解析エラー';
        }
      } else {
        console.error('❌ HTTP エラー:', xhr.status);
        statusDiv.innerHTML = '❌ サーバーエラー: ' + xhr.status;
      }
    };
    
    xhr.onerror = function() {
      console.error('❌ 通信エラー');
      statusDiv.innerHTML = '❌ 通信エラー';
    };
    
    xhr.send();
  };
  
  window.displayShops = function() {
    const statusDiv = document.getElementById('status');
    const listDiv = document.getElementById('shops-list');
    
    if (!shops || shops.length === 0) {
      statusDiv.innerHTML = '⚠️ 登録済み店舗がありません';
      listDiv.innerHTML = '';
      return;
    }
    
    statusDiv.innerHTML = '✅ ' + shops.length + '件の店舗を管理中';
    
    let html = '';
    for (let i = 0; i < shops.length; i++) {
      const shop = shops[i];
      html += '<div style="background:white;border:2px solid #2c5f2d;border-radius:15px;padding:25px;box-shadow:0 8px 20px rgba(44,95,45,0.15);">';
      html += '<h3 style="color:#2c5f2d;margin:0 0 15px 0;">' + (shop.name || '名前未設定') + '</h3>';
      if (shop.address) html += '<div style="margin:10px 0;">📍 ' + shop.address + '</div>';
      if (shop.short) html += '<div style="margin:10px 0;">⭐ ' + shop.short + '</div>';
      if (shop.category && shop.category.length) html += '<div style="margin:10px 0;">🏷️ ' + shop.category.join(', ') + '</div>';
      html += '<div style="margin-top:15px;">';
      html += '<button onclick="deleteShop(\'' + shop.id + '\')" style="background:#e74c3c;color:white;border:none;padding:8px 16px;border-radius:20px;cursor:pointer;">🗑️ 削除</button>';
      html += '</div>';
      html += '</div>';
    }
    
    listDiv.innerHTML = html;
  };
  
  window.deleteShop = function(id) {
    if (!confirm('本当に削除しますか？')) return;
    
    const xhr = new XMLHttpRequest();
    xhr.open('DELETE', API_BASE + '/shops/' + id, true);
    xhr.onload = function() {
      if (xhr.status === 200) {
        alert('削除しました');
        loadShops();
      } else {
        alert('削除に失敗しました');
      }
    };
    xhr.send();
  };
  
  window.resetForm = function() {
    document.getElementById('shop-form').reset();
  };
  
  window.exportData = function() {
    if (!shops || shops.length === 0) {
      alert('エクスポートするデータがありません');
      return;
    }
    
    const jsonStr = JSON.stringify(shops, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shops-' + new Date().toISOString().slice(0,19).replace(/:/g,'-') + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // フォーム送信処理
  setTimeout(function() {
    const form = document.getElementById('shop-form');
    if (form) {
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('shop-name').value.trim();
        if (!name) {
          alert('店舗名を入力してください');
          return;
        }
        
        const categories = [];
        const tags = [];
        const checks = document.querySelectorAll('input[type="checkbox"]:checked');
        for (let i = 0; i < checks.length; i++) {
          if (['スイーツ','食事','パン','ドリンク'].indexOf(checks[i].value) !== -1) {
            categories.push(checks[i].value);
          } else {
            tags.push(checks[i].value);
          }
        }
        
        const shopData = {
          id: 's' + Date.now(),
          name: name,
          address: document.getElementById('shop-address').value.trim(),
          category: categories,
          tags: tags,
          short: document.getElementById('shop-short').value.trim(),
          concept: document.getElementById('shop-concept').value.trim()
        };
        
        console.log('💾 店舗保存開始:', shopData);
        
        const xhr = new XMLHttpRequest();
        xhr.open('POST', API_BASE + '/shops', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        
        xhr.onload = function() {
          if (xhr.status === 200 || xhr.status === 201) {
            alert('✅ 店舗を登録しました！');
            resetForm();
            showSection('list');
          } else {
            alert('❌ 保存に失敗しました: ' + xhr.status);
          }
        };
        
        xhr.send(JSON.stringify(shopData));
      });
    }
  }, 100);
  
  // 初期データ読み込み
  loadShops();
})();