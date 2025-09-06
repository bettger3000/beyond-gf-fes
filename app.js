const state = {
  shops: [],
  filters: {
    categories: [],
    tags: []
  },
  currentModalShop: null,
  currentModalImages: null,
  currentImageIndex: 0
};

// Convert image paths to R2 bucket URLs via Worker API
function convertImagePath(imagePath) {
  if (!imagePath || imagePath === 'assets/placeholder.svg') {
    return 'assets/placeholder.svg';
  }
  
  // If already a full URL (including data URLs from management system), return as is
  if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
    return imagePath;
  }
  
  // Convert to R2 API URL for all images (only for relative paths)
  if (imagePath.endsWith('.svg') || imagePath.endsWith('.png') || 
      imagePath.endsWith('.jpg') || imagePath.endsWith('.jpeg') || 
      imagePath.endsWith('.webp')) {
    return `https://gf-fes-api.bettger1000.workers.dev/api/image/${imagePath}`;
  }
  
  return imagePath;
}

async function init() {
  try {
    // First try to load from local storage (管理システムで更新されたデータ)
    const localShops = localStorage.getItem('completeShops');
    if (localShops) {
      state.shops = JSON.parse(localShops);
      console.log('Loaded shops from local storage:', state.shops.length, 'shops');
    } else {
      // Fallback to Cloudflare Workers API
      let response = await fetch('https://gf-fes-api.bettger1000.workers.dev/api/shops');
      if (!response.ok) {
        // Fallback to local file for development
        response = await fetch('shops.json');
      }
      
      if (!response.ok) throw new Error('Failed to fetch shops data');
      state.shops = await response.json();
      console.log('Loaded shops from API:', state.shops.length, 'shops');
    }
    
    setupFilters();
    renderShops(state.shops);
    setupEventListeners();
    setupScrollEffects();
  } catch (error) {
    console.error('Failed to load shops data:', error);
  }
}

function setupFilters() {
  const categories = new Set();
  const tags = new Set();
  
  state.shops.forEach(shop => {
    // 管理システムのデータ形式（文字列）とAPI形式（配列）の両方に対応
    if (shop.category) {
      if (typeof shop.category === 'string') {
        shop.category.split(',').forEach(cat => categories.add(cat.trim()));
      } else if (Array.isArray(shop.category)) {
        shop.category.forEach(cat => categories.add(cat));
      }
    }
    
    if (shop.tags) {
      if (typeof shop.tags === 'string') {
        shop.tags.split(',').forEach(tag => tags.add(tag.trim()));
      } else if (Array.isArray(shop.tags)) {
        shop.tags.forEach(tag => tags.add(tag));
      }
    }
  });
  
  renderFilterButtons('category-filters', Array.from(categories), 'category');
  renderFilterButtons('tag-filters', Array.from(tags), 'tag');
}

function renderFilterButtons(containerId, items, type) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.innerHTML = items.map(item => `
    <button class="filter-btn" data-filter-type="${type}" data-filter-value="${item}">
      ${item}
    </button>
  `).join('');
}

function applyFilters() {
  let filteredShops = state.shops;
  
  if (state.filters.categories.length > 0) {
    filteredShops = filteredShops.filter(shop => {
      if (!shop.category) return false;
      
      let categories = [];
      if (typeof shop.category === 'string') {
        categories = shop.category.split(',').map(cat => cat.trim());
      } else if (Array.isArray(shop.category)) {
        categories = shop.category;
      }
      
      return categories.some(cat => state.filters.categories.includes(cat));
    });
  }
  
  if (state.filters.tags.length > 0) {
    filteredShops = filteredShops.filter(shop => {
      if (!shop.tags) return false;
      
      let tags = [];
      if (typeof shop.tags === 'string') {
        tags = shop.tags.split(',').map(tag => tag.trim());
      } else if (Array.isArray(shop.tags)) {
        tags = shop.tags;
      }
      
      return tags.some(tag => state.filters.tags.includes(tag));
    });
  }
  
  renderShops(filteredShops);
}

function renderShops(shops) {
  const grid = document.getElementById('shop-grid');
  const noResults = document.getElementById('no-results');
  
  if (!grid) return;
  
  if (shops.length === 0) {
    grid.innerHTML = '';
    if (noResults) noResults.style.display = 'block';
    return;
  }
  
  if (noResults) noResults.style.display = 'none';
  
  grid.innerHTML = shops.map(shop => {
    // カテゴリの処理
    let categoryDisplay = '';
    if (shop.category) {
      let categories = [];
      if (typeof shop.category === 'string') {
        categories = shop.category.split(',').map(cat => cat.trim());
      } else if (Array.isArray(shop.category)) {
        categories = shop.category;
      }
      if (categories.length > 0) {
        categoryDisplay = `<span class="shop-card-category">${categories[0]}</span>`;
      }
    }

    // タグの処理
    let tagsDisplay = '';
    if (shop.tags) {
      let tags = [];
      if (typeof shop.tags === 'string') {
        tags = shop.tags.split(',').map(tag => tag.trim());
      } else if (Array.isArray(shop.tags)) {
        tags = shop.tags;
      }
      if (tags.length > 0) {
        tagsDisplay = `
          <div class="shop-card-tags">
            ${tags.slice(0, 3).map(tag => 
              `<span class="shop-card-tag">${tag}</span>`
            ).join('')}
          </div>
        `;
      }
    }

    return `
      <div class="shop-card" data-shop-id="${shop.id}">
        <div class="shop-card-image">
          <img src="${convertImagePath(shop.thumb) || 'assets/placeholder.svg'}" 
               alt="${shop.name}" 
               loading="lazy">
        </div>
        <div class="shop-card-body">
          ${categoryDisplay}
          <h3 class="shop-card-title">${shop.name}</h3>
          <p class="shop-card-desc">${shop.short}</p>
          ${tagsDisplay}
        </div>
      </div>
    `;
  }).join('');
}

// renderPickupShops function removed - all shops now shown in main grid

function openModal(shopId) {
  const shop = state.shops.find(s => s.id === shopId);
  if (!shop) return;
  
  state.currentModalShop = shop;
  const modal = document.getElementById('modal');
  const modalBody = document.getElementById('modal-body');
  
  if (!modal || !modalBody) return;
  
  // Create all available images array (thumb + photos)
  const allImages = [];
  if (shop.thumb && shop.thumb !== 'assets/placeholder.svg') {
    allImages.push(convertImagePath(shop.thumb));
  }
  if (shop.photos && Array.isArray(shop.photos)) {
    allImages.push(...shop.photos.filter(photo => photo && photo !== 'assets/placeholder.svg').map(photo => convertImagePath(photo)));
  }
  
  const mainPhoto = allImages[0] || convertImagePath(shop.thumb) || 'assets/placeholder.svg';
  
  modalBody.innerHTML = `
    <div class="modal-header">
      <div class="modal-images">
        <div class="modal-image-main">
          <img src="${mainPhoto}" alt="${shop.name}" id="modal-main-image">
          ${allImages.length > 1 ? `
            <div class="modal-image-nav">
              <button class="modal-nav-btn prev" onclick="navigateModalImage(-1)" aria-label="前の画像">‹</button>
              <span class="modal-image-counter">
                <span id="modal-current-image">1</span> / ${allImages.length}
              </span>
              <button class="modal-nav-btn next" onclick="navigateModalImage(1)" aria-label="次の画像">›</button>
            </div>
          ` : ''}
        </div>
        ${allImages.length > 1 ? `
          <div class="modal-image-thumbs">
            ${allImages.map((photo, index) => `
              <div class="modal-image-thumb ${index === 0 ? 'active' : ''}" data-image="${photo}" data-index="${index}">
                <img src="${photo}" alt="${shop.name} ${index + 1}">
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
      
      ${shop.category ? shop.category.map(cat => 
        `<span class="modal-category">${cat}</span>`
      ).join(' ') : ''}
      
      <h2 class="modal-title">${shop.name}</h2>
      
      ${shop.tags ? `
        <div class="modal-tags">
          ${shop.tags.map(tag => 
            `<span class="modal-tag">${tag}</span>`
          ).join('')}
        </div>
      ` : ''}
    </div>
    
    ${shop.concept ? `
      <div class="modal-section">
        <h3>お店のコンセプト</h3>
        <p class="modal-text">${shop.concept}</p>
      </div>
    ` : ''}
    
    ${shop.desc ? `
      <div class="modal-section">
        <h3>商品説明</h3>
        <p class="modal-text">${shop.desc}</p>
      </div>
    ` : ''}
    
    ${shop.targetCustomer ? `
      <div class="modal-section">
        <h3>どんな人に食べてもらいたいか</h3>
        <p class="modal-text">${shop.targetCustomer}</p>
      </div>
    ` : ''}
    
    ${shop.story ? `
      <div class="modal-section">
        <h3>創業・ストーリー</h3>
        <p class="modal-text">${shop.story}</p>
      </div>
    ` : ''}
    
    ${shop.recommendation ? `
      <div class="modal-section">
        <h3>おすすめポイント・想い</h3>
        <p class="modal-text">${shop.recommendation}</p>
      </div>
    ` : ''}
    
    ${shop.allergyInfo && shop.allergyInfo.length > 0 ? `
      <div class="modal-section">
        <h3>アレルギー対応</h3>
        <div class="modal-allergy-info">
          ${shop.allergyInfo.map(allergy => 
            `<span class="modal-allergy-tag">${allergy}</span>`
          ).join('')}
        </div>
      </div>
    ` : ''}
    
    ${shop.contamination ? `
      <div class="modal-section">
        <h3>コンタミネーション情報</h3>
        <div class="modal-contamination">
          <span class="modal-contamination-level ${shop.contamination.includes('専用施設') ? 'level-safe' : shop.contamination.includes('専用ライン') ? 'level-moderate' : 'level-caution'}">${shop.contamination}</span>
        </div>
      </div>
    ` : ''}
    
    ${shop.menu && shop.menu.length > 0 ? `
      <div class="modal-section">
        <h3>メニュー</h3>
        <div class="modal-menu">
          ${shop.menu.map(item => `
            <div class="modal-menu-item">
              <span class="modal-menu-name">${item.name}</span>
              <span class="modal-menu-price">¥${item.price.toLocaleString()}</span>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}
    
    ${shop.address || shop.googleMaps ? `
      <div class="modal-section">
        <h3>アクセス情報</h3>
        <div class="modal-access">
          ${shop.address ? `
            <div class="modal-address">
              <span class="modal-address-label">住所</span>
              <span class="modal-address-text">${shop.address}</span>
            </div>
          ` : ''}
          ${shop.googleMaps ? `
            <div class="modal-map-link">
              <a href="${shop.googleMaps}" target="_blank" rel="noopener noreferrer" class="modal-map-button">
                📍 Googleマップで開く
              </a>
            </div>
          ` : ''}
        </div>
      </div>
    ` : ''}
    
    
    ${shop.links && (shop.links.site || shop.links.instagram) ? `
      <div class="modal-section">
        <h3>リンク</h3>
        <div class="modal-links">
          ${shop.links.site ? `
            <a href="${shop.links.site}" target="_blank" rel="noopener" class="modal-link">
              ウェブサイト
            </a>
          ` : ''}
          ${shop.links.instagram ? `
            <a href="${shop.links.instagram}" target="_blank" rel="noopener" class="modal-link">
              Instagram
            </a>
          ` : ''}
        </div>
      </div>
    ` : ''}
  `;
  
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  
  setupModalImageSwitcher();
  setupModalKeyboardNavigation();
  trapFocus(modal);
}

function closeModal() {
  const modal = document.getElementById('modal');
  if (!modal) return;
  
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  
  // Remove keyboard navigation listener
  if (state.modalKeydownHandler) {
    document.removeEventListener('keydown', state.modalKeydownHandler);
    state.modalKeydownHandler = null;
  }
  
  state.currentModalShop = null;
  state.currentModalImages = null;
  state.currentImageIndex = 0;
}

function setupModalImageSwitcher() {
  const thumbs = document.querySelectorAll('.modal-image-thumb');
  const mainImage = document.getElementById('modal-main-image');
  
  if (!mainImage || thumbs.length === 0) return;
  
  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      const imageSrc = thumb.dataset.image;
      const imageIndex = parseInt(thumb.dataset.index);
      if (!imageSrc) return;
      
      switchToImage(imageIndex);
    });
  });

  // Store image data in state for navigation
  if (!state.currentModalImages) {
    const shop = state.currentModalShop;
    if (shop) {
      state.currentModalImages = [];
      if (shop.thumb && shop.thumb !== 'assets/placeholder.svg') {
        state.currentModalImages.push(shop.thumb);
      }
      if (shop.photos && Array.isArray(shop.photos)) {
        state.currentModalImages.push(...shop.photos.filter(photo => photo && photo !== 'assets/placeholder.svg'));
      }
      state.currentImageIndex = 0;
    }
  }
}

function switchToImage(index) {
  const mainImage = document.getElementById('modal-main-image');
  const counter = document.getElementById('modal-current-image');
  const thumbs = document.querySelectorAll('.modal-image-thumb');
  
  if (!mainImage || !state.currentModalImages || index < 0 || index >= state.currentModalImages.length) return;
  
  state.currentImageIndex = index;
  mainImage.src = state.currentModalImages[index];
  
  if (counter) {
    counter.textContent = index + 1;
  }
  
  thumbs.forEach((thumb, i) => {
    thumb.classList.toggle('active', i === index);
  });
}

function navigateModalImage(direction) {
  if (!state.currentModalImages || state.currentModalImages.length <= 1) return;
  
  let newIndex = state.currentImageIndex + direction;
  
  // Loop around
  if (newIndex < 0) {
    newIndex = state.currentModalImages.length - 1;
  } else if (newIndex >= state.currentModalImages.length) {
    newIndex = 0;
  }
  
  switchToImage(newIndex);
}

function setupModalKeyboardNavigation() {
  const handleKeydown = (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      navigateModalImage(-1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      navigateModalImage(1);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closeModal();
    }
  };
  
  document.addEventListener('keydown', handleKeydown);
  
  // Store reference to remove listener when modal closes
  state.modalKeydownHandler = handleKeydown;
}

function trapFocus(modal) {
  const focusableElements = modal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];
  
  if (!firstFocusable) return;
  
  firstFocusable.focus();
  
  modal.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    
    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus();
      }
    }
  });
}

function setupEventListeners() {
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('filter-btn')) {
      handleFilterClick(e.target);
    }
    
    if (e.target.closest('.shop-card')) {
      const shopId = e.target.closest('.shop-card').dataset.shopId;
      openModal(shopId);
    }
    
    
    if (e.target.classList.contains('modal-close') || 
        e.target.classList.contains('modal-overlay')) {
      closeModal();
    }
  });
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && state.currentModalShop) {
      closeModal();
    }
  });
  
  const clearButton = document.getElementById('filter-clear');
  if (clearButton) {
    clearButton.addEventListener('click', () => {
      state.filters.categories = [];
      state.filters.tags = [];
      document.querySelectorAll('.filter-btn').forEach(btn => 
        btn.classList.remove('active')
      );
      applyFilters();
    });
  }
}

function handleFilterClick(button) {
  const type = button.dataset.filterType;
  const value = button.dataset.filterValue;
  
  if (!type || !value) return;
  
  const filterArray = type === 'category' ? state.filters.categories : state.filters.tags;
  const index = filterArray.indexOf(value);
  
  if (index > -1) {
    filterArray.splice(index, 1);
    button.classList.remove('active');
  } else {
    filterArray.push(value);
    button.classList.add('active');
  }
  
  applyFilters();
}

function setupScrollEffects() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  
  let lastScroll = 0;
  
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
  }, { passive: true });
  
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const headerHeight = header.offsetHeight;
        const targetPosition = target.offsetTop - headerHeight - 20;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', init);