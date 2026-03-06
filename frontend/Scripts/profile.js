// Scripts/profile.js
import { cartIconEvent } from "./general.js";

document.querySelectorAll('.js-home-profile').forEach(el => el.addEventListener('click', () => {
  const user = JSON.parse(localStorage.getItem('fh_user')||'null');
  if(!user) return window.location.href='index.html';
  window.location.href = `options.html?id=${user.user_id}`;
}));

document.querySelectorAll('.js-home-title').forEach(el => el.addEventListener('click', () => {
  const user = JSON.parse(localStorage.getItem('fh_user')||'null');
  const id = user ? user.user_id : '';
  window.location.href = `home.html?id=${id}`;
}));

document.querySelectorAll('.js-home-favourite').forEach(el => el.addEventListener('click', () => {
  const user = JSON.parse(localStorage.getItem('fh_user')||'null');
  const id = user ? user.user_id : '';
  window.location.href = `favourite.html?id=${id}`;
}));

function profileRenderHTML() {
  const user = JSON.parse(localStorage.getItem('fh_user')||'null');
  if(!user) return window.location.href='index.html';
  document.querySelector('.js-username').innerHTML = user.name;
  document.querySelector('.js-address').innerHTML = user.address || '';
  document.querySelector('.js-mobile').innerHTML = user.phone || '';
  document.querySelector('.js-email').innerHTML = user.email || '';
}

profileRenderHTML();
cartIconEvent();
