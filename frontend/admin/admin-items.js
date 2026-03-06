// admin-items.js
const tokenI = localStorage.getItem('fh_token');
if (!tokenI) { location.href = 'login.html'; throw new Error('no auth'); }
const listI = document.getElementById('list');
const newBtn = document.getElementById('new');
if (newBtn) newBtn.addEventListener('click', () => showForm());

async function load() {
  listI.innerHTML = '<p class="loading">Loading...</p>';
  try {
    const res = await fetch('/api/admin/items', { headers: { Authorization: `Bearer ${tokenI}` } });
    if (res.status === 401) { location.href = 'login.html'; return; }
    if (!res.ok) { listI.innerHTML = '<p class="warn">Failed to load items</p>'; return; }
    const rows = await res.json();
    if (!rows || !rows.length) { listI.innerHTML = '<p class="empty">No items</p>'; return; }
    const html = `<table class="table"><thead><tr><th>Image</th><th>Name</th><th>Restaurant</th><th>Price</th><th>Actions</th></tr></thead><tbody>${rows.map(r => `<tr data-id="${r.item_id}" data-restaurant-id="${r.restaurant_id || ''}" data-name="${escapeAttr(r.name)}" data-price="${escapeAttr(String(r.price))}" data-image="${escapeAttr(r.image||'')}"><td>${r.image ? `<img src="${escapeAttr(r.image)}" alt="" class="admin-thumb" onerror="this.style.display='none'">` : '—'}</td><td>${escapeHtml(r.name)}</td><td>${escapeHtml(r.restaurant_name || '')}</td><td>${escapeHtml(String(r.price))}</td><td><button type="button" class="btn btn-sm edit">Edit</button> <button type="button" class="btn btn-sm btn-danger del">Delete</button></td></tr>`).join('')}</tbody></table>`;
    listI.innerHTML = html;
    listI.querySelectorAll('.del').forEach(b => b.addEventListener('click', async (e) => {
      const id = e.target.closest('tr').dataset.id;
      if (!confirm('Delete this item?')) return;
      const r = await fetch(`/api/admin/items/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${tokenI}` } });
      if (r.status === 401) { location.href = 'login.html'; return; }
      load();
    }));
    listI.querySelectorAll('.edit').forEach(b => b.addEventListener('click', (e) => {
      const tr = e.target.closest('tr');
      showForm({ item_id: tr.dataset.id, name: tr.dataset.name, price: tr.dataset.price, restaurant_id: tr.dataset.restaurantId, image: tr.dataset.image || '' });
    }));
  } catch (err) {
    console.error(err);
    listI.innerHTML = '<p class="warn">Failed to load items</p>';
  }
}

function escapeAttr(s) { return String(s ?? '').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }
function escapeHtml(s) { return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

function showForm(data = {}) {
  listI.innerHTML = `
    <div class="form-card">
      <h3>${data.item_id ? 'Edit' : 'New'} Item</h3>
      <div class="form-group">
        <label for="name">Name</label>
        <input id="name" class="input" placeholder="Name" value="${escapeAttr(data.name || '')}">
      </div>
      <div class="form-group">
        <label for="price">Price</label>
        <input id="price" class="input" type="number" step="0.01" placeholder="Price" value="${escapeAttr(data.price || '')}">
      </div>
      <div class="form-group">
        <label for="restaurant">Restaurant ID</label>
        <input id="restaurant" class="input" placeholder="Restaurant ID" value="${escapeAttr(data.restaurant_id || '')}">
      </div>
      <div class="form-group">
        <label for="image">Image URL</label>
        <input id="image" class="input" type="url" placeholder="https://example.com/image.jpg" value="${escapeAttr(data.image || '')}">
      </div>
      <div class="form-actions">
        <button id="save" class="btn primary">${data.item_id ? 'Save' : 'Create'}</button>
        <button id="cancel" class="btn ghost">Cancel</button>
      </div>
    </div>`;
  document.getElementById('cancel').addEventListener('click', load);
  document.getElementById('save').addEventListener('click', async () => {
    const body = {
      name: document.getElementById('name').value.trim(),
      price: parseFloat(document.getElementById('price').value || 0) || 0,
      restaurant_id: document.getElementById('restaurant').value.trim() || null,
      image: document.getElementById('image').value.trim() || null
    };
    if (!body.name) { alert('Name is required'); return; }
    try {
      const url = data.item_id ? `/api/admin/items/${data.item_id}` : '/api/admin/items';
      const method = data.item_id ? 'PUT' : 'POST';
      const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenI}` }, body: JSON.stringify(body) });
      if (r.status === 401) { location.href = 'login.html'; return; }
      if (!r.ok) { const j = await r.json().catch(() => ({})); alert(j.error || 'Save failed'); return; }
      load();
    } catch (err) { console.error(err); alert('Save failed'); }
  });
}

load();
