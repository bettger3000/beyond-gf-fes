// 管理画面JavaScript - 完全版
console.log('管理画面スクリプト開始 v2025090413');

const API_BASE = 'https://gf-fes-api.bettger1000.workers.dev';
let shopManager;

class ShopManager {
  constructor() {
    this.shops = [];
    this.init();
  }

  async init() {
    await this.loadShops();
    this.bindEvents();
  }

  async loadShops() {
    try {
      console.log('店舗データ読み込み開始');
      const response = await fetch(`${API_BASE}/api/shops`);
      this.shops = await response.json();
      console.log('取得した店舗数:', this.shops.length);
      this.displayShops();
    } catch (error) {
      console.error('店舗データ読み込みエラー:', error);
    }
  }

  displayShops() {
    const container = document.getElementById('shopsList');
    if (!container) return;
    
    container.innerHTML = this.shops.map(shop => `
      <div class="shop-card">
        <div class="shop-name">${shop.name}</div>
        <div class="shop-info">
          カテゴリ: ${Array.isArray(shop.category) ? shop.category.join(', ') : '未設定'}
        </div>
        <div class="shop-info">
          住所: ${shop.address || '未設定'}
        </div>
        ${shop.thumb ? `<img src="${this.convertImagePath(shop.thumb)}" class="image-preview" alt="サムネイル">` : ''}
      </div>
    `).join('');
  }

  convertImagePath(imagePath) {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    
    // SVG, PNG, JPG, JPEG, WEBPファイルはR2から配信
    if (imagePath.endsWith('.svg') || imagePath.endsWith('.png') || 
        imagePath.endsWith('.jpg') || imagePath.endsWith('.jpeg') || 
        imagePath.endsWith('.webp')) {
      return `${API_BASE}/api/image/${imagePath}`;
    }
    
    return imagePath;
  }

  bindEvents() {
    // ナビゲーションボタン
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const targetSection = this.dataset.section;
        
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        const section = document.getElementById(targetSection);
        if (section) section.classList.add('active');
      });
    });

    // 画像アップロード
    const thumbInput = document.getElementById('thumbInput');
    if (thumbInput) {
      thumbInput.addEventListener('change', () => this.handleImageUpload(thumbInput, 'thumb'));
    }
  }

  async handleImageUpload(input, type) {
    const file = input.files[0];
    if (!file) return;

    console.log('画像アップロード開始:', file.name);

    try {
      // プログレス表示
      const progressDiv = document.createElement('div');
      progressDiv.style.color = '#007bff';
      progressDiv.style.marginTop = '10px';
      progressDiv.textContent = '⏳ アップロード中...';
      input.parentElement.appendChild(progressDiv);

      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch(`${API_BASE}/api/upload-image`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`アップロード失敗: ${response.status}`);
      }

      const result = await response.json();
      console.log('アップロード成功:', result);

      // プログレス削除
      progressDiv.remove();

      // 成功メッセージ表示
      const successDiv = input.parentElement.querySelector('.success-msg');
      if (successDiv) {
        successDiv.style.display = 'block';
        setTimeout(() => {
          successDiv.style.display = 'none';
        }, 3000);
      }

      // 成功メッセージをアラートでも表示
      alert(`✅ 画像のアップロードが完了しました！\nファイル名: ${result.filename}`);

    } catch (error) {
      console.error('画像アップロードエラー:', error);
      alert('画像のアップロードに失敗しました: ' + error.message);
      input.value = '';
      
      // プログレス削除
      const progressDiv = input.parentElement.querySelector('div[style*="color: #007bff"]');
      if (progressDiv) progressDiv.remove();
    }
  }
}

// グローバル関数として定義
window.handleImageUpload = async function(input, type, index = null) {
  const file = input.files[0];
  if (!file) return;

  console.log('画像アップロード開始:', file.name, 'タイプ:', type);

  // 画像サイズチェック (5MB制限)
  if (file.size > 5 * 1024 * 1024) {
    alert('画像サイズは5MB以下にしてください');
    input.value = '';
    return;
  }

  // 画像タイプチェック
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
  if (!validTypes.includes(file.type)) {
    alert('画像形式はJPEG、PNG、WebP、SVGのみ対応しています');
    input.value = '';
    return;
  }

  try {
    // プログレス表示を追加
    const progressDiv = document.createElement('div');
    progressDiv.style.color = '#007bff';
    progressDiv.style.marginTop = '10px';
    progressDiv.textContent = '⏳ アップロード中...';
    input.parentElement.appendChild(progressDiv);

    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch(`${API_BASE}/api/upload-image`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`アップロード失敗: ${response.status}`);
    }

    const result = await response.json();
    console.log('アップロード成功:', result);

    // プログレス削除
    progressDiv.remove();

    // 成功メッセージ表示
    const successDiv = input.parentElement.querySelector('.success-msg');
    if (successDiv) {
      successDiv.style.display = 'block';
      setTimeout(() => {
        successDiv.style.display = 'none';
      }, 3000);
    }

    // 成功通知
    alert(`✅ 画像のアップロードが完了しました！\nファイル名: ${result.filename}`);

  } catch (error) {
    console.error('画像アップロードエラー:', error);
    alert('画像のアップロードに失敗しました: ' + error.message);
    input.value = '';
    
    // プログレス削除
    const progressDiv = input.parentElement.querySelector('div[style*="color: #007bff"]');
    if (progressDiv) progressDiv.remove();
  }
};

window.testUpload = function() {
  console.log('テストアップロード実行');
  const input = document.getElementById('thumbInput');
  if (input && input.files.length > 0) {
    handleImageUpload(input, 'thumb');
  } else {
    alert('まず画像ファイルを選択してください');
  }
};

window.exportData = async function() {
  try {
    const response = await fetch(`${API_BASE}/api/shops`);
    const shops = await response.json();
    
    const dataStr = JSON.stringify(shops, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'shops-data.json';
    link.click();
    
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('データ出力エラー:', error);
    alert('データ出力に失敗しました');
  }
};

// 初期化
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM読み込み完了 - 管理画面初期化');
  shopManager = new ShopManager();
});

console.log('管理画面スクリプト準備完了 v2025090413');