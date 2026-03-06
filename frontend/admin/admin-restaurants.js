// admin-restaurants.js
const tokenR = localStorage.getItem('fh_token');
if (!tokenR) { location.href = 'login.html'; throw new Error('no auth'); }
const listEl = document.getElementById('list');
document.getElementById('new').addEventListener('click', () => showForm());

function escapeAttr(s) { return String(s ?? '').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }
function escapeHtml(s) { return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

async function load() {
  listEl.innerHTML = '<p class="loading">Loading...</p>';
  try {
    const res = await fetch('/api/admin/restaurants', { headers: { Authorization: `Bearer ${tokenR}` } });
    if (res.status === 401) { location.href = 'login.html'; return; }
    if (!res.ok) { listEl.innerHTML = '<p class="warn">Failed to load restaurants</p>'; return; }
    const rows = await res.json();
    if (!rows || !rows.length) { listEl.innerHTML = '<p class="empty">No restaurants</p>'; return; }
    const html = `<table class="table"><thead><tr><th>Image</th><th>Name</th><th>Phone</th><th>Rating</th><th>Actions</th></tr></thead><tbody>${rows.map(r => `<tr data-id="${r.restaurant_id}" data-name="${escapeAttr(r.name)}" data-phone="${escapeAttr(r.phone||'')}" data-opening="${escapeAttr(r.opening_hours||'')}" data-image="${escapeAttr(r.image||'')}"><td>${r.image ? `<img src="${escapeAttr(r.image)}" alt="" class="admin-thumb" onerror="this.style.display='none'">` : '—'}</td><td>${escapeHtml(r.name)}</td><td>${escapeHtml(r.phone||'')}</td><td>${r.rating||0}</td><td><button type="button" class="btn btn-sm edit">Edit</button> <button type="button" class="btn btn-sm btn-danger del">Delete</button></td></tr>`).join('')}</tbody></table>`;
    listEl.innerHTML = html;
    listEl.querySelectorAll('.del').forEach(b => b.addEventListener('click', async (e) => {
      const id = e.target.closest('tr').dataset.id;
      if (!confirm('Delete this restaurant?')) return;
      const r = await fetch(`/api/admin/restaurants/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${tokenR}` } });
      if (r.status === 401) { location.href = 'login.html'; return; }
      load();
    }));
    listEl.querySelectorAll('.edit').forEach(b => b.addEventListener('click', (e) => {
      const tr = e.target.closest('tr');
      showForm({ restaurant_id: tr.dataset.id, name: tr.dataset.name, phone: tr.dataset.phone, opening_hours: tr.dataset.opening, image: tr.dataset.image || '' });
    }));
  } catch (err) {
    console.error(err);
    listEl.innerHTML = '<p class="warn">Failed to load restaurants</p>';
  }
}

function showForm(data = {}) {
  listEl.innerHTML = `
    <div class="form-card">
      <h3>${data.restaurant_id ? 'Edit' : 'New'} Restaurant</h3>
      <div class="form-group">
        <label for="name">Name</label>
        <input id="name" class="input" placeholder="Name" value="${escapeAttr(data.name || '')}">
      </div>
      <div class="form-group">
        <label for="phone">Phone</label>
        <input id="phone" class="input" placeholder="Phone" value="${escapeAttr(data.phone || '')}">
      </div>
      <div class="form-group">
        <label for="opening">Opening hours</label>
        <input id="opening" class="input" placeholder="e.g. 9AM–10PM" value="${escapeAttr(data.opening_hours || '')}">
      </div>
      <div class="form-group">
        <label for="image">Image URL</label>
        <input id="image" class="input" type="url" placeholder="https://example.com/image.jpg" value="${escapeAttr(data.image || '')}">
      </div>
      <div class="form-actions">
        <button id="save" class="btn primary">${data.restaurant_id ? 'Save' : 'Create'}</button>
        <button id="cancel" class="btn ghost">Cancel</button>
      </div>
    </div>`;
  document.getElementById('cancel').addEventListener('click', load);
  document.getElementById('save').addEventListener('click', async () => {
    const body = { name: document.getElementById('name').value.trim(), phone: document.getElementById('phone').value.trim() || null, opening_hours: document.getElementById('opening').value.trim() || null, image: document.getElementById('image').value.trim() || null };
    try {
      const url = data.restaurant_id ? `/api/admin/restaurants/${data.restaurant_id}` : '/api/admin/restaurants';
      const method = data.restaurant_id ? 'PUT' : 'POST';
      const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenR}` }, body: JSON.stringify(body) });
      if (r.status === 401) { location.href = 'login.html'; return; }
      if (!r.ok) { const j = await r.json().catch(() => ({})); alert(j.error || 'Save failed'); return; }
      load();
    } catch (err) { console.error(err); alert('Save failed'); }
  });
}

load();
