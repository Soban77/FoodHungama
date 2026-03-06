// admin-reviews.js
const tokenR = localStorage.getItem('fh_token');
if (!tokenR) { location.href = 'login.html'; throw new Error('no auth'); }
const mainR = document.getElementById('main');

function escapeHtml(s) { return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

async function loadReviews() {
  mainR.innerHTML = '<p class="loading">Loading reviews...</p>';
  try {
    const res = await fetch('/api/admin/reviews', { headers: { Authorization: `Bearer ${tokenR}` } });
    if (res.status === 401) { location.href = 'login.html'; return; }
    if (!res.ok) { mainR.innerHTML = '<p class="warn">Failed to load reviews</p>'; return; }
    const list = await res.json();
    const reviews = Array.isArray(list) ? list : [];
    mainR.innerHTML = `<div class="table-wrap"><table class="table"><thead><tr><th>User</th><th>Restaurant</th><th>Rating</th><th>Comment</th><th>Actions</th></tr></thead><tbody>${reviews.map(r => `<tr data-id="${r.review_id}"><td>${escapeHtml(r.user_name || r.user_id)}</td><td>${escapeHtml(r.restaurant_name || r.restaurant_id)}</td><td><span class="badge badge-rating">${r.rating}</span></td><td class="comment-cell">${escapeHtml((r.comment||'').slice(0,80))}${(r.comment||'').length>80?'…':''}</td><td><button type="button" class="btn btn-sm btn-danger del">Delete</button></td></tr>`).join('')}</tbody></table></div>${!reviews.length?'<p class="empty">No reviews</p>':''}`;
    mainR.querySelectorAll('.del').forEach(b => b.addEventListener('click', async (e) => {
      const id = e.target.closest('tr').dataset.id;
      if (!confirm('Delete this review?')) return;
      const r = await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${tokenR}` } });
      if (r.status === 401) { location.href = 'login.html'; return; }
      loadReviews();
    }));
  } catch (err) { console.error(err); mainR.innerHTML = '<p class="warn">Failed to load reviews</p>'; }
}

loadReviews();
