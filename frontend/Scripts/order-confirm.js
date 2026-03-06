// Order confirmation page: show order success and details
const token = localStorage.getItem('fh_token');
const user = JSON.parse(localStorage.getItem('fh_user') || 'null');

if (!token || !user) {
  window.location.href = 'index.html';
}

const url = new URL(window.location.href);
const orderId = url.searchParams.get('order_id');
const contentEl = document.getElementById('confirm-content');

function escapeHtml(s) {
  if (s == null) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function imageUrl(img) {
  if (img && img.startsWith('http')) return img;
  if (img && img.startsWith('/')) return img;
  return img || 'Images/Food_Item_Images/placeholder.jpg';
}

async function loadOrder() {
  if (!orderId) {
    contentEl.innerHTML = '<div class="confirm-success-header"><h2>Order placed</h2><p>Thank you for your order.</p></div><p class="confirm-order-id">No order ID in URL. <a href="home.html">Go to Home</a></p>';
    return;
  }
  try {
    const res = await fetch(`/api/orders/${orderId}`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.status === 401) {
      window.location.href = 'index.html';
      return;
    }
    if (!res.ok) {
      contentEl.innerHTML = '<p class="payment-empty">Order not found. <a href="home.html">Go to Home</a></p>';
      return;
    }
    const order = await res.json();
    const items = order.items || [];
    const total = order.total_amount != null ? Number(order.total_amount) : 0;
    const itemsHtml = items.map(it => `
      <li>
        <img src="${escapeHtml(imageUrl(it.image))}" alt="" onerror="this.src='Images/Food_Item_Images/placeholder.jpg'">
        <span class="item-name">${escapeHtml(it.name || 'Item')}</span>
        <span class="item-qty">× ${escapeHtml(String(it.quantity))}</span>
        <span class="item-price">Rs. ${escapeHtml(String(Number(it.price) * Number(it.quantity)))}</span>
      </li>
    `).join('');
    contentEl.innerHTML = `
      <div class="confirm-success-header">
        <div class="icon">✓</div>
        <h2>Order confirmed!</h2>
        <p>Thank you for your order.</p>
      </div>
      <p class="confirm-order-id">Order #${escapeHtml(String(order.order_id))}</p>
      <ul class="confirm-items">${itemsHtml}</ul>
      <p class="confirm-total">Total: Rs. ${total.toFixed(0)}</p>
    `;
  } catch (err) {
    console.error(err);
    contentEl.innerHTML = '<p class="payment-empty">Could not load order. <a href="home.html">Go to Home</a></p>';
  }
}

document.querySelector('.js-confirm-title')?.addEventListener('click', () => { window.location.href = 'home.html'; });
document.querySelector('.js-confirm-profile')?.addEventListener('click', () => {
  const uid = user?.user_id || '';
  window.location.href = uid ? `options.html?id=${uid}` : 'index.html';
});

loadOrder();
