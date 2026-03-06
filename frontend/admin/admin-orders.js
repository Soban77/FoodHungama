// admin-orders.js
const tokenO = localStorage.getItem('fh_token');
if (!tokenO) { location.href = 'login.html'; throw new Error('no auth'); }
const listO = document.getElementById('list');

function escapeHtml(s) { return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

async function load() {
  listO.innerHTML = '<p class="loading">Loading...</p>';
  try {
    const res = await fetch('/api/admin/orders', { headers: { Authorization: `Bearer ${tokenO}` } });
    if (res.status === 401) { location.href = 'login.html'; return; }
    if (!res.ok) { listO.innerHTML = '<p class="warn">Failed to load orders</p>'; return; }
    const rows = await res.json();
    const list = Array.isArray(rows) ? rows : [];
    if (!list.length) { listO.innerHTML = '<p class="empty">No orders</p>'; return; }
    const html = `<table class="table"><thead><tr><th>Order</th><th>User</th><th>Restaurant</th><th>Total</th><th>Status</th><th>Actions</th></tr></thead><tbody>${list.map(o => `<tr data-id="${o.order_id}"><td>${escapeHtml(o.order_id)}</td><td>${escapeHtml(o.user_id)}</td><td>${escapeHtml(o.restaurant_id)}</td><td>${escapeHtml(o.total_amount != null ? String(o.total_amount) : '')}</td><td><span class="badge badge-status">${escapeHtml(o.status || '')}</span></td><td><button type="button" class="btn btn-sm edit">Change status</button></td></tr>`).join('')}</tbody></table>`;
    listO.innerHTML = html;
    listO.querySelectorAll('.edit').forEach(btn => btn.addEventListener('click', (e) => {
      const tr = e.target.closest('tr');
      const id = tr.dataset.id;
      const current = tr.querySelector('.badge-status')?.textContent || '';
      const newStatus = prompt('New status (pending / confirmed / dispatched / delivered / cancelled):', current);
      if (!newStatus || !newStatus.trim()) return;
      update(id, { status: newStatus.trim() });
    }));
  } catch (err) {
    console.error(err);
    listO.innerHTML = '<p class="warn">Failed to load orders</p>';
  }
}

async function update(id, body) {
  try {
    const r = await fetch(`/api/admin/orders/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenO}` }, body: JSON.stringify(body) });
    if (r.status === 401) { location.href = 'login.html'; return; }
    if (!r.ok) { const j = await r.json().catch(() => ({})); alert(j.error || 'Update failed'); return; }
    load();
  } catch (err) { console.error(err); alert('Update failed'); }
}

load();
