// Convert image paths to Cloudflare Pages static file URLs
function convertImagePath(imagePath) {
  if (!imagePath || imagePath === 'assets/placeholder.svg') {
    return 'assets/placeholder.svg';
  }
  
  // If already a full URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // If already in correct assets/shops/ format, return as is
  if (imagePath.startsWith('assets/shops/')) {
    return imagePath;
  }
  
  // For image names without path prefix (e.g., 'tomarigi.svg'), add assets/shops/ prefix
  if (imagePath.endsWith('.svg') || imagePath.endsWith('.png') || 
      imagePath.endsWith('.jpg') || imagePath.endsWith('.jpeg') || 
      imagePath.endsWith('.webp')) {
    return `assets/shops/${imagePath}`;
  }
  
  return imagePath;
}

class ShopManager {
  constructor() {
    this.shops = [];
    this.currentEditId = null;
    this.menuItemCounter = 0;
    this.imageData = {}; // Store image data for each shop
    this.init();
  }

  async init() {
    // サーバー接続テスト
    const serverConnected = await this.testServerConnection();
    if (serverConnected) {
      this.showMessage('サーバーに接続しました。変更はshops.jsonに自動保存されます。', 'success');
    } else {
      this.showMessage('サーバーに接続できません。手動でJSONをエクスポートしてください。', 'error');
    }
    
    await this.loadShops();
    this.renderShopsList();
    this.setupEventListeners();
  }

  async loadShops() {
    try {
      const response = await fetch('https://gf-fes-api.bettger1000.workers.dev/api/shops');
      if (response.ok) {
        this.shops = await response.json();
      } else {
        // Fallback to direct file access
        const fallbackResponse = await fetch('shops.json');
        if (fallbackResponse.ok) {
          this.shops = await fallbackResponse.json();
        }
      }
    } catch (error) {
      console.error('Failed to load shops:', error);
      this.shops = [];
    }
  }

  setupEventListeners() {
    const form = document.getElementById('shop-form');
    form.addEventListener('submit', (e) => this.handleSubmit(e));
  }

  renderShopsList() {
    const container = document.getElementById('shops-list');
    if (!container) return;

    if (this.shops.length === 0) {
      container.innerHTML = '<p>登録されている店舗がありません。</p>';
      return;
    }

    container.innerHTML = this.shops.map(shop => `
      <div class="shop-item">
        <h3>${shop.name}</h3>
        <p><strong>カテゴリ:</strong> ${shop.category?.join(', ') || 'なし'}</p>
        <p><strong>所在地:</strong> ${shop.location || 'なし'}</p>
        <p><strong>概要:</strong> ${shop.short}</p>
        <p><strong>タグ:</strong> ${shop.tags?.join(', ') || 'なし'}</p>
        <div class="shop-item-actions">
          <button class="btn btn-secondary btn-small" onclick="shopManager.editShop('${shop.id}')">編集</button>
          <button class="btn btn-danger btn-small" onclick="shopManager.deleteShop('${shop.id}')">削除</button>
        </div>
      </div>
    `).join('');
  }

  editShop(id) {
    const shop = this.shops.find(s => s.id === id);
    if (!shop) return;

    this.currentEditId = id;
    document.getElementById('form-title').textContent = '店舗情報編集';
    
    // 基本情報の入力
    document.getElementById('edit-id').value = shop.id;
    document.getElementById('name').value = shop.name || '';
    document.getElementById('location').value = shop.location || '';
    document.getElementById('address').value = shop.address || '';
    document.getElementById('googleMaps').value = shop.googleMaps || '';
    document.getElementById('short').value = shop.short || '';
    document.getElementById('concept').value = shop.concept || '';
    document.getElementById('desc').value = shop.desc || '';
    document.getElementById('targetCustomer').value = shop.targetCustomer || '';
    document.getElementById('story').value = shop.story || '';
    document.getElementById('recommendation').value = shop.recommendation || '';
    document.getElementById('contamination').value = shop.contamination || '';
    
    // カテゴリの選択
    document.querySelectorAll('input[name="category"]').forEach(checkbox => {
      checkbox.checked = shop.category?.includes(checkbox.value) || false;
    });
    
    // タグの選択
    document.querySelectorAll('input[name="tags"]').forEach(checkbox => {
      checkbox.checked = shop.tags?.includes(checkbox.value) || false;
    });
    
    // アレルギー情報の選択
    document.querySelectorAll('input[name="allergyInfo"]').forEach(checkbox => {
      checkbox.checked = shop.allergyInfo?.includes(checkbox.value) || false;
    });
    
    // リンク情報
    document.getElementById('instagram').value = shop.links?.instagram || '';
    document.getElementById('website').value = shop.links?.site || '';
    
    // ピックアップ
    document.getElementById('pickup').checked = shop.pickup || false;
    
    // メニューの表示
    this.renderMenuItems(shop.menu || []);
    
    // 画像データの設定
    this.imageData[id] = {
      thumb: shop.thumb || null,
      photos: shop.photos || []
    };
    
    // 画像の表示
    this.renderImages(shop);
    
    showSection('add');
  }

  async deleteShop(id) {
    if (!confirm('この店舗を削除してもよろしいですか？')) return;
    
    // 削除前の状態をバックアップ
    const originalShops = [...this.shops];
    
    // ローカル状態を更新
    this.shops = this.shops.filter(shop => shop.id !== id);
    
    // サーバーに保存
    const success = await this.saveShopsToServer();
    
    if (success) {
      this.renderShopsList();
      this.showMessage('店舗を削除しました。', 'success');
    } else {
      // 失敗時は元に戻す
      this.shops = originalShops;
      this.showMessage('削除に失敗しました。再度お試しください。', 'error');
    }
  }

  renderMenuItems(menuItems = []) {
    const container = document.getElementById('menu-items');
    if (!container) return;

    this.menuItemCounter = 0;
    container.innerHTML = '';
    
    menuItems.forEach(item => {
      this.addMenuItem(item.name, item.price);
    });
    
    if (menuItems.length === 0) {
      this.addMenuItem();
    }
  }

  addMenuItem(name = '', price = '') {
    const container = document.getElementById('menu-items');
    const itemId = `menu-item-${this.menuItemCounter++}`;
    
    const menuItemDiv = document.createElement('div');
    menuItemDiv.className = 'menu-item';
    menuItemDiv.innerHTML = `
      <input type="text" name="menu-name" placeholder="メニュー名" value="${name}" class="menu-name">
      <input type="number" name="menu-price" placeholder="価格" value="${price}" min="0" class="menu-price">
      <button type="button" class="btn btn-danger btn-small" onclick="this.parentElement.remove()">削除</button>
    `;
    
    container.appendChild(menuItemDiv);
  }

  async handleSubmit(e) {
    e.preventDefault();
    
    if (!this.validateForm()) {
      return;
    }

    const formData = new FormData(e.target);
    let shopData = this.buildShopData(formData);
    shopData = this.updateShopImages(shopData);
    
    let isNewShop = false;
    
    if (this.currentEditId) {
      // 編集
      const index = this.shops.findIndex(s => s.id === this.currentEditId);
      if (index !== -1) {
        shopData.id = this.currentEditId;
        this.shops[index] = shopData;
      }
    } else {
      // 新規追加
      shopData.id = this.generateId();
      this.shops.push(shopData);
      isNewShop = true;
    }
    
    // サーバーに保存
    const success = await this.saveShopsToServer();
    
    if (success) {
      this.showMessage(
        isNewShop ? '新しい店舗を追加しました。' : '店舗情報を更新しました。',
        'success'
      );
      this.renderShopsList();
      this.resetForm();
      showSection('list');
    } else {
      this.showMessage('保存に失敗しました。再度お試しください。', 'error');
      // ローカル状態を元に戻す
      if (isNewShop) {
        this.shops.pop();
      } else {
        await this.loadShops(); // データを再読み込み
      }
    }
  }

  buildShopData(formData) {
    const shop = {
      name: formData.get('name'),
      location: formData.get('location') || undefined,
      address: formData.get('address') || undefined,
      googleMaps: formData.get('googleMaps') || undefined,
      short: formData.get('short'),
      concept: formData.get('concept') || undefined,
      desc: formData.get('desc') || undefined,
      targetCustomer: formData.get('targetCustomer') || undefined,
      story: formData.get('story') || undefined,
      recommendation: formData.get('recommendation') || undefined,
      contamination: formData.get('contamination'),
      category: formData.getAll('category'),
      tags: formData.getAll('tags'),
      allergyInfo: formData.getAll('allergyInfo'),
      pickup: formData.get('pickup') === 'on'
    };

    // メニューデータの構築
    const menuNames = formData.getAll('menu-name');
    const menuPrices = formData.getAll('menu-price');
    shop.menu = [];
    
    for (let i = 0; i < menuNames.length; i++) {
      if (menuNames[i] && menuPrices[i]) {
        shop.menu.push({
          name: menuNames[i],
          price: parseInt(menuPrices[i]) || 0
        });
      }
    }

    // リンクデータの構築
    const instagram = formData.get('instagram');
    const website = formData.get('website');
    if (instagram || website) {
      shop.links = {};
      if (instagram) shop.links.instagram = instagram;
      if (website) shop.links.site = website;
    }

    // 画像パスの設定（店舗名から自動生成）
    const shopNameForFile = shop.name.toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[^\w\-]/g, '');
    shop.thumb = `assets/shops/${shopNameForFile}.svg`;
    shop.photos = [`assets/shops/${shopNameForFile}_1.webp`, `assets/shops/${shopNameForFile}_2.webp`];

    return shop;
  }

  validateForm() {
    let isValid = true;
    const requiredFields = ['name', 'short', 'contamination'];
    
    // 必須フィールドの検証
    requiredFields.forEach(fieldName => {
      const field = document.getElementById(fieldName);
      if (!field.value.trim()) {
        field.classList.add('error');
        isValid = false;
      } else {
        field.classList.remove('error');
      }
    });

    // カテゴリの検証
    const categories = document.querySelectorAll('input[name="category"]:checked');
    if (categories.length === 0) {
      this.showMessage('カテゴリを少なくとも1つ選択してください。', 'error');
      isValid = false;
    }

    if (!isValid) {
      this.showMessage('必須項目を入力してください。', 'error');
    }

    return isValid;
  }

  generateId() {
    const maxId = this.shops.reduce((max, shop) => {
      const numId = parseInt(shop.id.substring(1));
      return numId > max ? numId : max;
    }, 0);
    
    return `s${String(maxId + 1).padStart(2, '0')}`;
  }

  resetForm() {
    const form = document.getElementById('shop-form');
    form.reset();
    
    this.currentEditId = null;
    document.getElementById('form-title').textContent = '新規店舗追加';
    document.getElementById('edit-id').value = '';
    
    // エラー表示をクリア
    document.querySelectorAll('.form-control.error').forEach(field => {
      field.classList.remove('error');
    });
    
    // メニューアイテムをリセット
    this.renderMenuItems([]);
    
    // 画像をリセット
    this.clearImagePreviews();
    this.imageData[this.currentEditId || 'new'] = { thumb: null, photos: [] };
  }

  showMessage(message, type = 'success') {
    const container = document.getElementById('messages');
    if (!container) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `${type}-message`;
    messageDiv.textContent = message;
    
    container.innerHTML = '';
    container.appendChild(messageDiv);
    
    // 3秒後にメッセージを消去
    setTimeout(() => {
      if (container.contains(messageDiv)) {
        container.removeChild(messageDiv);
      }
    }, 3000);
  }

  exportData() {
    const output = document.getElementById('json-output');
    if (!output) return;
    
    const jsonData = JSON.stringify(this.shops, null, 2);
    output.textContent = jsonData;
  }

  renderImages(shop) {
    // Display existing images if editing
    if (shop) {
      // Display thumbnail
      if (shop.thumb) {
        this.displayImagePreview('thumb-preview', shop.thumb, 'thumb');
      }
      
      // Display detail images
      if (shop.photos && Array.isArray(shop.photos)) {
        shop.photos.forEach((photo, index) => {
          if (index < 4) { // Max 4 detail images
            this.displayImagePreview(`detail-${index}-preview`, photo, 'detail', index);
          }
        });
      }
    } else {
      // Clear all previews
      this.clearImagePreviews();
    }
  }

  displayImagePreview(previewId, imageSrc, type, index = null) {
    const preview = document.getElementById(previewId);
    if (!preview) return;

    preview.innerHTML = `
      <img src="${convertImagePath(imageSrc)}" alt="Preview">
      <button type="button" class="remove-image" onclick="shopManager.removeImage('${type}', ${index})">×</button>
    `;
    preview.classList.add('has-image');
  }

  clearImagePreviews() {
    // Clear thumbnail preview
    const thumbPreview = document.getElementById('thumb-preview');
    if (thumbPreview) {
      thumbPreview.innerHTML = '<div class="placeholder">サムネイル画像を選択</div>';
      thumbPreview.classList.remove('has-image');
    }

    // Clear detail image previews
    for (let i = 0; i < 4; i++) {
      const detailPreview = document.getElementById(`detail-${i}-preview`);
      if (detailPreview) {
        detailPreview.innerHTML = '<div class="placeholder">画像を選択</div>';
        detailPreview.classList.remove('has-image');
      }
    }
  }

  removeImage(type, index = null) {
    if (type === 'thumb') {
      const preview = document.getElementById('thumb-preview');
      preview.innerHTML = '<div class="placeholder">サムネイル画像を選択</div>';
      preview.classList.remove('has-image');
      
      // Clear the file input
      const fileInput = document.querySelector('input[name="thumb-image"]');
      if (fileInput) fileInput.value = '';
      
      // Remove from image data
      if (this.currentEditId && this.imageData[this.currentEditId]) {
        delete this.imageData[this.currentEditId].thumb;
      }
    } else if (type === 'detail' && index !== null) {
      const preview = document.getElementById(`detail-${index}-preview`);
      preview.innerHTML = '<div class="placeholder">画像を選択</div>';
      preview.classList.remove('has-image');
      
      // Clear the file input
      const fileInput = document.querySelector(`input[name="detail-image-${index + 1}"]`);
      if (fileInput) fileInput.value = '';
      
      // Remove from image data
      if (this.currentEditId && this.imageData[this.currentEditId] && this.imageData[this.currentEditId].photos) {
        this.imageData[this.currentEditId].photos[index] = null;
      }
    }
  }

  updateShopImages(shopData) {
    const shopId = shopData.id || this.currentEditId;
    
    if (this.imageData[shopId]) {
      // Update thumbnail
      if (this.imageData[shopId].thumb) {
        shopData.thumb = this.imageData[shopId].thumb;
      }
      
      // Update photos array
      if (this.imageData[shopId].photos) {
        shopData.photos = this.imageData[shopId].photos.filter(photo => photo !== null);
      }
    }
    
    return shopData;
  }

  async saveShopsToServer() {
    try {
      const response = await fetch('https://gf-fes-api.bettger1000.workers.dev/api/shops', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.shops)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Shops saved to server:', result);
        return true;
      } else {
        const errorText = await response.text();
        console.error('Server error:', errorText);
        return false;
      }
    } catch (error) {
      console.error('Network error saving shops:', error);
      return false;
    }
  }

  async testServerConnection() {
    try {
      const response = await fetch('https://gf-fes-api.bettger1000.workers.dev/api/shops');
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

// グローバル関数
function showSection(sectionName) {
  // すべてのセクションを非表示
  document.querySelectorAll('.section').forEach(section => {
    section.classList.remove('active');
  });
  
  // ナビゲーションボタンの状態更新
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // 指定されたセクションを表示
  document.getElementById(`${sectionName}-section`).classList.add('active');
  event.target.classList.add('active');
}

function addMenuItem() {
  shopManager.addMenuItem();
}

function resetForm() {
  shopManager.resetForm();
}

function exportData() {
  shopManager.exportData();
}

async function handleImageUpload(input, type, index = null) {
  const file = input.files[0];
  if (!file) return;

  // Validate file type
  if (!file.type.startsWith('image/')) {
    alert('画像ファイルを選択してください。');
    input.value = '';
    return;
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert('ファイルサイズは5MB以下にしてください。');
    input.value = '';
    return;
  }

  try {
    // Show upload progress
    const progressDiv = document.createElement('div');
    progressDiv.textContent = 'アップロード中...';
    progressDiv.style.color = '#007bff';
    progressDiv.style.fontSize = '12px';
    progressDiv.style.marginTop = '5px';
    input.parentElement.appendChild(progressDiv);

    // For now, use a placeholder path since we're switching to static files
    // In production, this would involve a proper file upload to assets/shops/
    const timestamp = Date.now();
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const imageUrl = `assets/shops/${timestamp}_${safeFileName}`;
    
    // Note: In a real implementation, the file would need to be uploaded to assets/shops/
    // For now, we'll simulate the upload
    console.log(`画像をアップロードしました: ${imageUrl}`);
    
    // Initialize image data for current shop if not exists
    const shopId = shopManager.currentEditId || 'new';
    if (!shopManager.imageData[shopId]) {
      shopManager.imageData[shopId] = { thumb: null, photos: [] };
    }

    if (type === 'thumb') {
      // Store thumbnail path
      shopManager.imageData[shopId].thumb = imageUrl;
      shopManager.displayImagePreview('thumb-preview', imageUrl, 'thumb');
    } else if (type === 'detail' && index !== null) {
      // Store detail image path
      if (!shopManager.imageData[shopId].photos) {
        shopManager.imageData[shopId].photos = [];
      }
      shopManager.imageData[shopId].photos[index] = imageUrl;
      shopManager.displayImagePreview(`detail-${index}-preview`, imageUrl, 'detail', index);
    }

    // Remove progress indicator
    progressDiv.remove();
    
    // Show instruction for manual file placement
    const instructionDiv = document.createElement('div');
    instructionDiv.innerHTML = `
      <p style="color: #28a745; font-size: 12px; margin-top: 5px;">
        ✓ 画像パスが設定されました<br>
        <small>実際の画像ファイルは assets/shops/ フォルダに手動で配置してください</small>
      </p>
    `;
    input.parentElement.appendChild(instructionDiv);
    
    setTimeout(() => instructionDiv.remove(), 5000);
    
  } catch (error) {
    console.error('画像アップロードエラー:', error);
    alert('画像のアップロードに失敗しました: ' + error.message);
    input.value = '';
    
    // Remove progress indicator if exists
    const progressDiv = input.parentElement.querySelector('div[style*="color: #007bff"]');
    if (progressDiv) progressDiv.remove();
  }
}

// アプリケーションの初期化
let shopManager;
document.addEventListener('DOMContentLoaded', () => {
  shopManager = new ShopManager();
});