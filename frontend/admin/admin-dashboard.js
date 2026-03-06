// admin-dashboard.js
const token = localStorage.getItem('fh_token');
if (!token) { window.location.href = 'login.html'; throw new Error('no auth'); }

document.getElementById('logout').addEventListener('click', () => {
  localStorage.removeItem('fh_token');
  localStorage.removeItem('fh_admin');
  window.location.href = 'login.html';
});

const pingEl = document.getElementById('ping');
async function checkPing() {
  if (!pingEl) return;
  pingEl.textContent = 'Checking…';
  pingEl.classList.remove('ping-ok', 'ping-fail');
  try {
    const r = await fetch('/api/ping');
    const j = await r.json();
    if (j.ok) { pingEl.textContent = 'Server OK'; pingEl.classList.add('ping-ok'); }
    else { pingEl.textContent = 'No response'; pingEl.classList.add('ping-fail'); }
  } catch (e) {
    pingEl.textContent = 'Ping failed';
    pingEl.classList.add('ping-fail');
  }
}
document.getElementById('btn-refresh').addEventListener('click', checkPing);
checkPing();
