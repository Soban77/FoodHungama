// admin-users.js
const token = localStorage.getItem('fh_token');
if (!token) { location.href = 'login.html'; throw new Error('no auth'); }
const main = document.getElementById('main');

function escapeAttr(s) { return String(s ?? '').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }
function escapeHtml(s) { return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

async function loadUsers() {
  main.innerHTML = '<p class="loading">Loading users...</p>';
  try {
    const res = await fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } });
    if (res.status === 401) { location.href = 'login.html'; return; }
    if (!res.ok) { main.innerHTML = '<p class="warn">Failed to load users</p>'; return; }
    const list = await res.json();
    const users = Array.isArray(list) ? list : [];
    main.innerHTML = `<div class="table-wrap"><table class="table"><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Wallet</th><th>Address</th><th>Actions</th></tr></thead><tbody>${users.map(u => `<tr data-id="${u.user_id}" data-name="${escapeAttr(u.name)}" data-phone="${escapeAttr(u.phone||'')}" data-role="${escapeAttr(u.role||'')}" data-wallet="${escapeAttr(String(u.wallet_balance!=null?u.wallet_balance:0))}" data-address="${escapeAttr(u.address||'')}"><td>${escapeHtml(u.name)}</td><td>${escapeHtml(u.email)}</td><td>${escapeHtml(u.phone||'')}</td><td><span class="badge badge-role">${escapeHtml(u.role||'')}</span></td><td>${escapeHtml(String(u.wallet_balance!=null?u.wallet_balance:0))}</td><td>${escapeHtml((u.address||'').slice(0,30))}${(u.address||'').length>30?'…':''}</td><td><button type="button" class="btn btn-sm edit">Edit</button></td></tr>`).join('')}</tbody></table></div>${!users.length?'<p class="empty">No users</p>':''}`;
    main.querySelectorAll('.edit').forEach(b => b.addEventListener('click', (e) => editUser(e)));
  } catch (err) {
    console.error(err);
    main.innerHTML = '<p class="warn">Failed to load users</p>';
  }
}

function editUser(e) {
  const tr = e.target.closest('tr');
  const id = tr.dataset.id;
  const name = tr.dataset.name || '';
  const phone = tr.dataset.phone || '';
  const role = tr.dataset.role || 'customer';
  const wallet = tr.dataset.wallet || '0';
  const address = tr.dataset.address || '';

  main.innerHTML = `
    <div class="form-card">
      <h3>Edit User</h3>
      <div class="form-group"><label for="u-name">Name</label><input id="u-name" class="input" value="${escapeAttr(name)}"></div>
      <div class="form-group"><label for="u-phone">Phone</label><input id="u-phone" class="input" value="${escapeAttr(phone)}"></div>
      <div class="form-group"><label for="u-role">Role</label><select id="u-role" class="input"><option value="customer" ${role==='customer'?'selected':''}>customer</option><option value="admin" ${role==='admin'?'selected':''}>admin</option><option value="owner" ${role==='owner'?'selected':''}>owner</option></select></div>
      <div class="form-group"><label for="u-wallet">Wallet</label><input id="u-wallet" class="input" type="number" step="0.01" value="${escapeAttr(wallet)}"></div>
      <div class="form-group"><label for="u-address">Address</label><input id="u-address" class="input" value="${escapeAttr(address)}"></div>
      <div class="form-actions"><button id="u-save" class="btn primary">Save</button> <button id="u-cancel" class="btn ghost">Cancel</button></div>
    </div>`;
  document.getElementById('u-cancel').addEventListener('click', loadUsers);
  document.getElementById('u-save').addEventListener('click', async () => {
    const body = { name: document.getElementById('u-name').value.trim(), phone: document.getElementById('u-phone').value.trim() || null, role: document.getElementById('u-role').value, wallet_balance: parseFloat(document.getElementById('u-wallet').value || '0') || 0, address: document.getElementById('u-address').value.trim() || null };
    try {
      const r = await fetch(`/api/admin/users/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
      if (r.status === 401) { location.href = 'login.html'; return; }
      if (!r.ok) { const j = await r.json().catch(() => ({})); alert(j.error || 'Save failed'); return; }
      loadUsers();
    } catch (err) { console.error(err); alert('Save failed'); }
  });
}

loadUsers();
