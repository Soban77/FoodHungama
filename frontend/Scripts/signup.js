// Scripts/signup.js (API-backed signup)
async function signUpInteract() {
  const btn = document.querySelector('.js-signup-signup');
  if(!btn) return;
  btn.addEventListener('click', async () => {
    const email = document.querySelector('.js-email').value.trim();
    const name = document.querySelector('.js-username').value.trim();
    const password = document.querySelector('.js-password').value.trim();
    const phone = document.querySelector('.js-phone').value.trim();
    const address = document.querySelector('.js-address').value.trim();

    if(!email||!name||!password||!phone||!address) {
      document.querySelector('.js-empty-account').style.display = "flex";
      setTimeout(()=> document.querySelector('.js-empty-account').style.display = "none",2000);
      return;
    }

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ name, email, password, phone, address })
      });
      const data = await res.json();
      if(!res.ok) {
        alert(data.error || 'Signup failed');
        return;
      }
      localStorage.setItem('fh_token', data.token);
      localStorage.setItem('fh_user', JSON.stringify(data.user));
      window.location.href = `home.html?id=${data.user.user_id}`;
    } catch(err) {
      console.error(err);
      alert('Network error');
    }
  });
}

signUpInteract();
