// admin-deliveries.js
const tokenD = localStorage.getItem('fh_token');
if (!tokenD) { location.href = 'login.html'; throw new Error('no auth'); }
const mainD = document.getElementById('main');

function escapeAttr(s) { return String(s ?? '').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }
function escapeHtml(s) { return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

async function loadDeliveries() {
  mainD.innerHTML = '<p class="loading">Loading deliveries...</p>';
  try {
    const res = await fetch('/api/admin/deliveries', { headers: { Authorization: `Bearer ${tokenD}` } });
    if (res.status === 401) { location.href = 'login.html'; return; }
    if (!res.ok) { mainD.innerHTML = '<p class="warn">Failed to load deliveries</p>'; return; }
    const list = await res.json();
    const deliveries = Array.isArray(list) ? list : [];
    mainD.innerHTML = `
      <div class="card-header">
        <h3>Deliveries</h3>
        <button id="new" class="btn primary">New Delivery</button>
      </div>
      <div class="table-wrap">
        <table class="table">
          <thead><tr><th>ID</th><th>Order</th><th>Status</th><th>Person</th><th>Contact</th><th>Actions</th></tr></thead>
          <tbody>${deliveries.map(d => `<tr data-id="${d.delivery_id}" data-order="${d.order_id}" data-status="${escapeAttr(d.delivery_status||'')}" data-person="${escapeAttr(d.delivery_person_id||'')}" data-contact="${escapeAttr(d.contact||'')}"><td>${escapeHtml(d.delivery_id)}</td><td>${escapeHtml(d.order_id)}</td><td><span class="badge badge-status">${escapeHtml(d.delivery_status||'')}</span></td><td>${escapeHtml(d.delivery_person_id||'—')}</td><td>${escapeHtml(d.contact||'—')}</td><td><button type="button" class="btn btn-sm edit">Edit</button></td></tr>`).join('')}</tbody>
        </table>
      </div>
      ${!deliveries.length ? '<p class="empty">No deliveries</p>' : ''}`;
    const newBtn = document.getElementById('new');
    if (newBtn) newBtn.addEventListener('click', showCreate);
    mainD.querySelectorAll('.edit').forEach(b => b.addEventListener('click', (e) => editDelivery(e)));
  } catch (err) { console.error(err); mainD.innerHTML = '<p class="warn">Failed to load deliveries</p>'; }
}

function showCreate() {
  mainD.innerHTML = `
    <div class="form-card">
      <h3>New Delivery</h3>
      <div class="form-group"><label for="d-order">Order ID</label><input id="d-order" class="input" placeholder="Order ID"></div>
      <div class="form-group"><label for="d-person">Delivery Person ID</label><input id="d-person" class="input" placeholder="Optional"></div>
      <div class="form-group"><label for="d-contact">Contact</label><input id="d-contact" class="input" placeholder="Contact"></div>
      <div class="form-group"><label for="d-status">Status</label><input id="d-status" class="input" value="assigned" placeholder="e.g. assigned"></div>
      <div class="form-group"><label for="d-time">Delivery time</label><input id="d-time" class="input" type="datetime-local"></div>
      <div class="form-actions"><button id="d-save" class="btn primary">Create</button> <button id="d-cancel" class="btn ghost">Cancel</button></div>
    </div>`;
  document.getElementById('d-cancel').addEventListener('click', loadDeliveries);
  document.getElementById('d-save').addEventListener('click', async () => {
    const body = { order_id: document.getElementById('d-order').value.trim(), delivery_person_id: document.getElementById('d-person').value.trim() || null, contact: document.getElementById('d-contact').value.trim() || null, delivery_status: document.getElementById('d-status').value.trim() || 'assigned', delivery_time: document.getElementById('d-time').value || null };
    try {
      const r = await fetch('/api/admin/deliveries', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenD}` }, body: JSON.stringify(body) });
      if (r.status === 401) { location.href = 'login.html'; return; }
      if (!r.ok) { const j = await r.json().catch(() => ({})); alert(j.error || 'Create failed'); return; }
      loadDeliveries();
    } catch (err) { console.error(err); alert('Failed'); }
  });
}

function editDelivery(e) {
  const tr = e.target.closest('tr');
  const id = tr.dataset.id;
  const status = tr.dataset.status || '';
  const person = tr.dataset.person || '';
  const contact = tr.dataset.contact || '';
  mainD.innerHTML = `
    <div class="form-card">
      <h3>Edit Delivery</h3>
      <div class="form-group"><label for="d-person">Delivery Person ID</label><input id="d-person" class="input" value="${escapeAttr(person)}"></div>
      <div class="form-group"><label for="d-contact">Contact</label><input id="d-contact" class="input" value="${escapeAttr(contact)}"></div>
      <div class="form-group"><label for="d-status">Status</label><input id="d-status" class="input" value="${escapeAttr(status)}"></div>
      <div class="form-group"><label for="d-time">Delivery time</label><input id="d-time" class="input" type="datetime-local"></div>
      <div class="form-actions"><button id="d-save" class="btn primary">Save</button> <button id="d-cancel" class="btn ghost">Cancel</button></div>
    </div>`;
  document.getElementById('d-cancel').addEventListener('click', loadDeliveries);
  document.getElementById('d-save').addEventListener('click', async () => {
    const body = { delivery_person_id: document.getElementById('d-person').value.trim() || null, contact: document.getElementById('d-contact').value.trim() || null, delivery_status: document.getElementById('d-status').value.trim() || null, delivery_time: document.getElementById('d-time').value || null };
    try {
      const r = await fetch(`/api/admin/deliveries/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenD}` }, body: JSON.stringify(body) });
      if (r.status === 401) { location.href = 'login.html'; return; }
      if (!r.ok) { const j = await r.json().catch(() => ({})); alert(j.error || 'Save failed'); return; }
      loadDeliveries();
    } catch (err) { console.error(err); alert('Failed'); }
  });
}

loadDeliveries();
