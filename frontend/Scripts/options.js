document.querySelector('.js-main-logout').addEventListener('click', () => {
  document.querySelector('.js-Confirmation').style.display = "block";
});

document.querySelector('.js-Confirmation-cross').addEventListener('click', () => {
  document.querySelector('.js-Confirmation').style.display = "none";
});

document.querySelector('.js-Confirmation-button1').addEventListener('click', () => {
  // clear token and user
  localStorage.removeItem('fh_token');
  localStorage.removeItem('fh_user');
  window.location.href = "index.html";
});

document.querySelector('.js-Confirmation-button2').addEventListener('click', () => {
  document.querySelector('.js-Confirmation').style.display = "none";
});

document.querySelector('.js-main-cross').addEventListener('click', () => {
  let url = new URL(window.location.href);
  let id = url.searchParams.get('id');
  window.location.href = `home.html?id=${id}`;
});

document.querySelector('.js-logout').addEventListener('click', () => {
  let url = new URL(window.location.href);
  let id = url.searchParams.get('id');
  window.location.href = `profile.html?id=${id}`;
});
