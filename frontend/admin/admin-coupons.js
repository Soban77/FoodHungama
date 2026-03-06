// admin-coupons.js
const tokenC = localStorage.getItem('fh_token');
if (!tokenC) { location.href = 'login.html'; throw new Error('no auth'); }
const mainC = document.getElementById('main');

function escapeAttr(s) { return String(s ?? '').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }

async function loadCoupons() {
  mainC.innerHTML = '<p class="loading">Loading coupons...</p>';
  try {
    const res = await fetch('/api/admin/coupons', { headers: { Authorization: `Bearer ${tokenC}` } });
    if (res.status === 401) { location.href = 'login.html'; return; }
    if (!res.ok) { mainC.innerHTML = '<p class="warn">Failed to load coupons</p>'; return; }
    const list = await res.json();
    const coupons = Array.isArray(list) ? list : [];
    mainC.innerHTML = `
      <div class="card-header">
        <h3>Coupons</h3>
        <button id="new" class="btn primary">New Coupon</button>
      </div>
      <div class="table-wrap">
        <table class="table">
          <thead><tr><th>Code</th><th>Discount</th><th>Expiry</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>${coupons.map(c => `<tr data-id="${c.coupon_id}" data-code="${escapeAttr(c.code)}" data-discount="${c.discount_percent || 0}" data-expiry="${escapeAttr((c.expiry_date || '').toString().slice(0, 10))}" data-active="${c.is_active}">
            <td>${escapeAttr(c.code)}</td>
            <td>${c.discount_percent || 0}%</td>
            <td>${(c.expiry_date || '').toString().slice(0, 10)}</td>
            <td><span class="badge ${c.is_active ? 'badge-success' : 'badge-muted'}">${c.is_active ? 'Active' : 'Inactive'}</span></td>
            <td><button type="button" class="btn btn-sm edit">Edit</button> <button type="button" class="btn btn-sm btn-danger del">Delete</button></td>
          </tr>`).join('')}</tbody>
        </table>
      </div>
      ${coupons.length === 0 ? '<p class="empty">No coupons yet</p>' : ''}`;
    const newBtn = document.getElementById('new');
    if (newBtn) newBtn.addEventListener('click', showCreate);
    mainC.querySelectorAll('.edit').forEach(b => b.addEventListener('click', e => editCoupon(e)));
    mainC.querySelectorAll('.del').forEach(b => b.addEventListener('click', async e => {
      const id = e.target.closest('tr').dataset.id;
      if (!confirm('Delete this coupon?')) return;
      const r = await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${tokenC}` } });
      if (r.status === 401) { location.href = 'login.html'; return; }
      loadCoupons();
    }));
  } catch (err) { console.error(err); mainC.innerHTML = '<p class="warn">Failed to load coupons</p>'; }
}

function showCreate() {
  mainC.innerHTML = `
    <div class="form-card">
      <h3>New Coupon</h3>
      <div class="form-group"><label for="c-code">Code</label><input id="c-code" class="input" placeholder="e.g. SAVE20"></div>
      <div class="form-group"><label for="c-discount">Discount %</label><input id="c-discount" class="input" type="number" min="0" max="100" placeholder="10"></div>
      <div class="form-group"><label for="c-expiry">Expiry</label><input id="c-expiry" class="input" type="date"></div>
      <div class="form-group form-check"><label><input id="c-active" type="checkbox" checked> Active</label></div>
      <div class="form-actions"><button id="c-save" class="btn primary">Create</button> <button id="c-cancel" class="btn ghost">Cancel</button></div>
    </div>`;
  document.getElementById('c-cancel').addEventListener('click', loadCoupons);
  document.getElementById('c-save').addEventListener('click', async () => {
    const body = { code: document.getElementById('c-code').value.trim(), discount_percent: parseInt(document.getElementById('c-discount').value || '0', 10), expiry_date: document.getElementById('c-expiry').value || null, is_active: document.getElementById('c-active').checked };
    if (!body.code) { alert('Code is required'); return; }
    try {
      const r = await fetch('/api/admin/coupons', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenC}` }, body: JSON.stringify(body) });
      if (r.status === 401) { location.href = 'login.html'; return; }
      if (!r.ok) { const j = await r.json().catch(() => ({})); alert(j.error || 'Create failed'); return; }
      loadCoupons();
    } catch (err) { console.error(err); alert('Failed'); }
  });
}

function editCoupon(e) {
  const tr = e.target.closest('tr');
  const id = tr.dataset.id;
  const code = tr.dataset.code || '';
  const discount = tr.dataset.discount || '0';
  const expiry = tr.dataset.expiry || '';
  const active = tr.dataset.active === 'true';
  mainC.innerHTML = `
    <div class="form-card">
      <h3>Edit Coupon</h3>
      <div class="form-group"><label for="c-code">Code</label><input id="c-code" class="input" value="${escapeAttr(code)}"></div>
      <div class="form-group"><label for="c-discount">Discount %</label><input id="c-discount" class="input" type="number" min="0" max="100" value="${escapeAttr(discount)}"></div>
      <div class="form-group"><label for="c-expiry">Expiry</label><input id="c-expiry" class="input" type="date" value="${escapeAttr(expiry)}"></div>
      <div class="form-group form-check"><label><input id="c-active" type="checkbox" ${active ? 'checked' : ''}> Active</label></div>
      <div class="form-actions"><button id="c-save" class="btn primary">Save</button> <button id="c-cancel" class="btn ghost">Cancel</button></div>
    </div>`;
  document.getElementById('c-cancel').addEventListener('click', loadCoupons);
  document.getElementById('c-save').addEventListener('click', async () => {
    const body = { code: document.getElementById('c-code').value.trim(), discount_percent: parseInt(document.getElementById('c-discount').value || '0', 10), expiry_date: document.getElementById('c-expiry').value || null, is_active: document.getElementById('c-active').checked };
    try {
      const r = await fetch(`/api/admin/coupons/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenC}` }, body: JSON.stringify(body) });
      if (r.status === 401) { location.href = 'login.html'; return; }
      if (!r.ok) { const j = await r.json().catch(() => ({})); alert(j.error || 'Save failed'); return; }
      loadCoupons();
    } catch (err) { console.error(err); alert('Failed'); }
  });
}

loadCoupons();
