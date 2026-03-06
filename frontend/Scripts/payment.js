// Payment page: load cart, apply coupon, place order, redirect to confirm
const token = localStorage.getItem('fh_token');
const user = JSON.parse(localStorage.getItem('fh_user') || 'null');

const url = new URL(window.location.href);
const restaurantId = url.searchParams.get('resid') || '';

if (!token || !user) {
  window.location.href = 'index.html';
}

const orderList = document.getElementById('order-list');
const subtotalEl = document.getElementById('subtotal');
const grandTotalEl = document.getElementById('grand-total');
const discountText = document.getElementById('discount-text');
const couponInput = document.getElementById('coupon-input');
const applyCouponBtn = document.getElementById('apply-coupon');
const placeOrderBtn = document.getElementById('place-order');
const fullnameInput = document.getElementById('fullname');
const phoneInput = document.getElementById('phone');
const addressInput = document.getElementById('address');

let cartItems = [];
let appliedDiscountPercent = 0;
let appliedCouponCode = '';

function escapeHtml(s) {
  if (s == null) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function imageUrl(img) {
  if (img && img.startsWith('http')) return img;
  if (img && img.startsWith('/')) return img;
  return img || 'Images/Food_Item_Images/placeholder.jpg';
}

async function loadCart() {
  orderList.innerHTML = '<p class="loading-payment">Loading cart…</p>';
  try {
    const res = await fetch('/api/cart', { headers: { Authorization: `Bearer ${token}` } });
    if (res.status === 401) {
      window.location.href = 'index.html';
      return;
    }
    const data = await res.json();
    cartItems = (data.items || []).filter(it => !restaurantId || String(it.restaurant_id) === String(restaurantId));
    if (restaurantId && cartItems.length === 0) {
      const resAll = await fetch('/api/cart', { headers: { Authorization: `Bearer ${token}` } });
      const dataAll = await resAll.json();
      cartItems = dataAll.items || [];
    }
    renderOrderSummary();
    prefillDelivery();
  } catch (err) {
    console.error(err);
    orderList.innerHTML = '<p class="payment-empty">Failed to load cart. <a href="home.html">Go to Home</a></p>';
  }
}

function prefillDelivery() {
  if (user && user.name) fullnameInput.value = user.name;
  if (user && user.phone) phoneInput.value = user.phone;
  if (user && user.address) addressInput.value = user.address;
}

function renderOrderSummary() {
  if (!cartItems.length) {
    orderList.innerHTML = '<p class="payment-empty">Your cart is empty. <a href="home.html">Browse restaurants</a></p>';
    subtotalEl.textContent = '0';
    grandTotalEl.textContent = '0';
    discountText.textContent = '';
    discountText.className = 'discount-text';
    placeOrderBtn.disabled = true;
    return;
  }
  placeOrderBtn.disabled = false;
  let subtotal = 0;
  const html = cartItems.map(it => {
    const lineTotal = Number(it.price) * Number(it.quantity);
    subtotal += lineTotal;
    return `<div class="order-item">
      <img src="${escapeHtml(imageUrl(it.image))}" alt="" onerror="this.src='Images/Food_Item_Images/placeholder.jpg'">
      <div class="order-item-info">
        <p class="name">${escapeHtml(it.name || 'Item')}</p>
        <p class="meta">Rs. ${escapeHtml(String(it.price))} × ${escapeHtml(String(it.quantity))}</p>
      </div>
    </div>`;
  }).join('');
  orderList.innerHTML = html;
  const discountAmount = subtotal * (appliedDiscountPercent / 100);
  const grandTotal = Math.max(0, subtotal - discountAmount);
  subtotalEl.textContent = subtotal.toFixed(0);
  grandTotalEl.textContent = grandTotal.toFixed(0);
  if (appliedDiscountPercent > 0) {
    discountText.textContent = `${appliedDiscountPercent}% discount applied (${appliedCouponCode})`;
    discountText.className = 'discount-text applied';
  } else {
    discountText.textContent = '';
    discountText.className = 'discount-text';
  }
}

applyCouponBtn.addEventListener('click', async () => {
  const code = (couponInput.value || '').trim();
  if (!code) {
    discountText.textContent = 'Enter a coupon code';
    discountText.className = 'discount-text invalid';
    return;
  }
  try {
    const res = await fetch(`/api/coupons/validate?code=${encodeURIComponent(code)}`);
    const data = await res.json();
    if (data.valid) {
      appliedDiscountPercent = Number(data.discount_percent) || 0;
      appliedCouponCode = code;
      discountText.textContent = `Coupon applied: ${appliedDiscountPercent}% off`;
      discountText.className = 'discount-text applied';
      renderOrderSummary();
    } else {
      appliedDiscountPercent = 0;
      appliedCouponCode = '';
      discountText.textContent = 'Invalid or expired coupon';
      discountText.className = 'discount-text invalid';
      renderOrderSummary();
    }
  } catch (err) {
    discountText.textContent = 'Could not validate coupon';
    discountText.className = 'discount-text invalid';
  }
});

placeOrderBtn.addEventListener('click', async () => {
  if (!cartItems.length) return;
  const delivery_address = [fullnameInput.value.trim(), phoneInput.value.trim(), addressInput.value.trim()].filter(Boolean).join(', ') || user?.address || '';
  if (!delivery_address.trim()) {
    alert('Please enter delivery name, phone and address.');
    return;
  }
  const payment_method = document.querySelector('input[name="method"]:checked')?.value || 'cod';
  const restaurant_id = restaurantId || (cartItems[0] && cartItems[0].restaurant_id) || null;

  placeOrderBtn.disabled = true;
  placeOrderBtn.textContent = 'Placing order…';
  try {
    const res = await fetch('/api/orders/place', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        restaurant_id,
        delivery_address,
        payment_method,
        coupon_code: appliedCouponCode || undefined
      })
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || 'Order failed');
      placeOrderBtn.disabled = false;
      placeOrderBtn.textContent = 'Place Order';
      return;
    }
    window.location.href = `order-confirm.html?order_id=${data.order_id}`;
  } catch (err) {
    console.error(err);
    alert('Network error');
    placeOrderBtn.disabled = false;
    placeOrderBtn.textContent = 'Place Order';
  }
});

document.querySelector('.js-payment-title')?.addEventListener('click', () => { window.location.href = 'home.html'; });
document.querySelector('.js-payment-profile')?.addEventListener('click', () => {
  const uid = user?.user_id || '';
  window.location.href = uid ? `options.html?id=${uid}` : 'index.html';
});

loadCart();
