// Scripts/index.js (API-backed login)
export let Users = []; // kept for compatibility

async function Interact() {
  const loginBtn = document.querySelector('.js-signin-login');
  if (loginBtn) {
    loginBtn.addEventListener('click', async () => {
      const emailOrUsername = document.querySelector('.js-sign-container-username').value.trim();
      const password = document.querySelector('.js-sign-container-password').value.trim();
      if (!emailOrUsername || !password) {
        document.querySelector('.js-empty-account').style.display = "flex";
        setTimeout(()=> document.querySelector('.js-empty-account').style.display = "none", 2000);
        return;
      }

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: emailOrUsername, password })
        });
        const data = await res.json();
        if (!res.ok) {
          document.querySelector('.js-invalid-account').style.display = "flex";
          setTimeout(()=> document.querySelector('.js-invalid-account').style.display = "none", 2000);
          return;
        }
        // save token+user
        localStorage.setItem('fh_token', data.token);
        localStorage.setItem('fh_user', JSON.stringify(data.user));
        window.location.href = `home.html?id=${data.user.user_id}`;
      } catch(err) {
        console.error(err);
        alert('Network error');
      }
    });
  }

  const signupBtn = document.querySelector('.js-signin-signup');
  if(signupBtn) signupBtn.addEventListener('click', ()=> window.location.href = "signup.html");
}

Interact();
