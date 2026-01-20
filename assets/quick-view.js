/**
 * Quick View Modal - Dawn Theme Compatible
 * Handles product quick view functionality
 */

class QuickViewModal {
  constructor() {
    this.modal = document.getElementById('QuickViewModal');
    if (!this.modal) return;
    
    this.init();
  }
  
  init() {
    this.bindEvents();
  }
  
  bindEvents() {
    // Close buttons
    document.querySelectorAll('[data-quick-view-close]').forEach(btn => {
      btn.addEventListener('click', () => this.close());
    });
    
    // ESC key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal.classList.contains('is-open')) {
        this.close();
      }
    });
    
    // Quick view buttons
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-quick-view]');
      if (btn) {
        e.preventDefault();
        const handle = btn.dataset.quickView;
        this.open(handle);
      }
    });
    
    // Quantity buttons
    this.modal.querySelectorAll('.quantity__button').forEach(btn => {
      btn.addEventListener('click', (e) => this.handleQuantity(e));
    });
    
    // Form submission
    const form = document.getElementById('QuickViewForm');
    if (form) {
      form.addEventListener('submit', (e) => this.handleAddToCart(e));
    }
  }
  
  async open(handle) {
    this.modal.classList.add('is-open');
    document.body.classList.add('quick-view-open');
    
    this.showLoading();
    
    try {
      const product = await this.fetchProduct(handle);
      this.renderProduct(product);
    } catch (error) {
      console.error('Quick View Error:', error);
      this.close();
    }
  }
  
  close() {
    this.modal.classList.remove('is-open');
    document.body.classList.remove('quick-view-open');
  }
  
  showLoading() {
    this.modal.querySelector('.quick-view-loading').style.display = 'flex';
    this.modal.querySelector('.quick-view-product').style.display = 'none';
  }
  
  hideLoading() {
    this.modal.querySelector('.quick-view-loading').style.display = 'none';
    this.modal.querySelector('.quick-view-product').style.display = 'grid';
  }
  
  async fetchProduct(handle) {
    const response = await fetch(`/products/${handle}.js`);
    if (!response.ok) throw new Error('Product not found');
    return response.json();
  }
  
  renderProduct(product) {
    this.currentProduct = product;
    this.currentVariant = product.variants[0];
    
    // Main image
    const mainImage = document.getElementById('QuickViewMainImage');
    mainImage.src = product.featured_image || product.images[0];
    mainImage.alt = product.title;
    
    // Thumbnails
    this.renderThumbnails(product.images);
    
    // Product info
    document.getElementById('QuickViewVendor').textContent = product.vendor;
    document.getElementById('QuickViewTitle').textContent = product.title;
    document.getElementById('QuickViewLink').href = `/products/${product.handle}`;
    
    // Description (strip HTML and limit length)
    const description = product.description.replace(/<[^>]*>/g, '');
    document.getElementById('QuickViewDescription').textContent = 
      description.length > 200 ? description.substring(0, 200) + '...' : description;
    
    // Price
    this.renderPrice(this.currentVariant);
    
    // Variants
    this.renderVariants(product);
    
    // Availability
    this.renderAvailability(this.currentVariant);
    
    // Variant ID
    document.getElementById('QuickViewVariantId').value = this.currentVariant.id;
    
    // Reset quantity
    document.getElementById('QuickViewQuantity').value = 1;
    
    this.hideLoading();
  }
  
  renderThumbnails(images) {
    const container = document.getElementById('QuickViewThumbnails');
    container.innerHTML = '';
    
    if (images.length <= 1) return;
    
    images.forEach((image, index) => {
      const thumb = document.createElement('button');
      thumb.className = `quick-view-thumbnail${index === 0 ? ' is-active' : ''}`;
      thumb.innerHTML = `<img src="${this.getSizedImage(image, '100x100')}" alt="">`;
      thumb.addEventListener('click', () => this.changeImage(image, thumb));
      container.appendChild(thumb);
    });
  }
  
  changeImage(image, thumb) {
    document.getElementById('QuickViewMainImage').src = image;
    
    document.querySelectorAll('.quick-view-thumbnail').forEach(t => {
      t.classList.remove('is-active');
    });
    thumb.classList.add('is-active');
  }
  
  getSizedImage(src, size) {
    if (!src) return '';
    return src.replace(/(\.[^.]+)$/, `_${size}$1`);
  }
  
  renderPrice(variant) {
    const container = document.getElementById('QuickViewPrice');
    const price = this.formatMoney(variant.price);
    
    if (variant.compare_at_price && variant.compare_at_price > variant.price) {
      const comparePrice = this.formatMoney(variant.compare_at_price);
      const savings = Math.round((1 - variant.price / variant.compare_at_price) * 100);
      
      container.innerHTML = `
        <span class="price-item--sale">${price}</span>
        <span class="price-item--compare">${comparePrice}</span>
        <span class="price__badge-sale">Save ${savings}%</span>
      `;
    } else {
      container.innerHTML = `<span class="price-item--regular">${price}</span>`;
    }
  }
  
  formatMoney(cents) {
    const amount = (cents / 100).toFixed(2);
    return '₱' + amount + ' PHP';
  }
  
  renderVariants(product) {
    const container = document.getElementById('QuickViewVariants');
    container.innerHTML = '';
    
    if (product.variants.length === 1 && product.variants[0].title === 'Default Title') {
      return;
    }
    
    product.options.forEach((option, optionIndex) => {
      const group = document.createElement('div');
      group.className = 'quick-view-variant-group';
      
      const values = [...new Set(product.variants.map(v => v.options[optionIndex]))];
      
      group.innerHTML = `
        <label>${option}</label>
        <div class="quick-view-variant-options">
          ${values.map((value, valueIndex) => `
            <button type="button" 
              class="quick-view-variant-option${valueIndex === 0 ? ' is-selected' : ''}"
              data-option-index="${optionIndex}"
              data-value="${value}">
              ${value}
            </button>
          `).join('')}
        </div>
      `;
      
      container.appendChild(group);
    });
    
    // Bind variant selection
    container.querySelectorAll('.quick-view-variant-option').forEach(btn => {
      btn.addEventListener('click', (e) => this.handleVariantChange(e));
    });
  }
  
  handleVariantChange(e) {
    const btn = e.target;
    const optionIndex = parseInt(btn.dataset.optionIndex);
    const value = btn.dataset.value;
    
    // Update selected state
    btn.parentElement.querySelectorAll('.quick-view-variant-option').forEach(b => {
      b.classList.remove('is-selected');
    });
    btn.classList.add('is-selected');
    
    // Find matching variant
    const selectedOptions = [];
    document.querySelectorAll('.quick-view-variant-options').forEach((group, index) => {
      const selected = group.querySelector('.is-selected');
      if (selected) {
        selectedOptions[index] = selected.dataset.value;
      }
    });
    
    const variant = this.currentProduct.variants.find(v => {
      return selectedOptions.every((opt, index) => v.options[index] === opt);
    });
    
    if (variant) {
      this.currentVariant = variant;
      document.getElementById('QuickViewVariantId').value = variant.id;
      this.renderPrice(variant);
      this.renderAvailability(variant);
      
      // Update image if variant has one
      if (variant.featured_image) {
        document.getElementById('QuickViewMainImage').src = variant.featured_image.src;
      }
    }
  }
  
  renderAvailability(variant) {
    const container = document.getElementById('QuickViewAvailability');
    const addBtn = document.getElementById('QuickViewAddBtn');
    
    if (variant.available) {
      container.className = 'quick-view-availability in-stock';
      container.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        In stock
      `;
      addBtn.disabled = false;
      addBtn.querySelector('span').textContent = 'Add to cart';
    } else {
      container.className = 'quick-view-availability out-of-stock';
      container.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
        Out of stock
      `;
      addBtn.disabled = true;
      addBtn.querySelector('span').textContent = 'Sold out';
    }
  }
  
  handleQuantity(e) {
    const input = document.getElementById('QuickViewQuantity');
    const action = e.target.closest('button').dataset.action;
    let value = parseInt(input.value) || 1;
    
    if (action === 'increase') {
      value++;
    } else if (action === 'decrease' && value > 1) {
      value--;
    }
    
    input.value = value;
  }
  
  async handleAddToCart(e) {
    e.preventDefault();
    
    const form = e.target;
    const addBtn = document.getElementById('QuickViewAddBtn');
    
    addBtn.classList.add('is-loading');
    addBtn.disabled = true;
    
    try {
      const formData = new FormData(form);
      
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) throw new Error('Add to cart failed');
      
      const data = await response.json();
      
      // Success - update cart count and close modal
      this.updateCartCount();
      
      addBtn.querySelector('span').textContent = 'Added!';
      
      setTimeout(() => {
        this.close();
        addBtn.classList.remove('is-loading');
        addBtn.disabled = false;
        addBtn.querySelector('span').textContent = 'Add to cart';
      }, 1000);
      
    } catch (error) {
      console.error('Add to cart error:', error);
      addBtn.classList.remove('is-loading');
      addBtn.disabled = false;
      addBtn.querySelector('span').textContent = 'Error - Try again';
    }
  }
  
  async updateCartCount() {
    try {
      const response = await fetch('/cart.js');
      const cart = await response.json();
      
      // Update cart count in header
      const cartCounts = document.querySelectorAll('.cart-count-bubble span[aria-hidden="true"], .cart-count');
      cartCounts.forEach(el => {
        el.textContent = cart.item_count;
      });
      
      // Show cart bubble if hidden
      const cartBubble = document.querySelector('.cart-count-bubble');
      if (cartBubble && cart.item_count > 0) {
        cartBubble.style.display = '';
      }
      
    } catch (error) {
      console.error('Update cart count error:', error);
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new QuickViewModal();
});