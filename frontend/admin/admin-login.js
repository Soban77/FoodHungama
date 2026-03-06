// admin-login.js
const emailEl = document.getElementById('email');
const passEl = document.getElementById('password');
const btn = document.getElementById('login');
const err = document.getElementById('err');

btn.addEventListener('click', async () => {
  err.style.display='none';
  const email = emailEl.value.trim();
  const password = passEl.value.trim();
  if(!email || !password) { err.innerText='Enter credentials'; err.style.display='block'; return; }
  try {
    const res = await fetch('/api/auth/login', {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ email, password })
    });
    if(!res.ok) {
      const j = await res.json();
      err.innerText = j.error || 'Login failed';
      err.style.display='block';
      return;
    }
    const data = await res.json();
    // ensure role admin
    if(!data.user || data.user.role !== 'admin') {
      err.innerText = 'Not an admin';
      err.style.display='block';
      return;
    }
    localStorage.setItem('fh_token', data.token);
    localStorage.setItem('fh_admin', JSON.stringify(data.user));
    window.location.href = 'dashboard.html';
  } catch (e) {
    console.error(e);
    err.innerText='Server error';
    err.style.display='block';
  }
});
