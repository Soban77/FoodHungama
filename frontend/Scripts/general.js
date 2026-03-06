// Scripts/general.js
import { Restaurants } from "./home.js";

export function renderGeneralHTML() {
  let html = '';
  let resIds = [];
  const cart = JSON.parse(localStorage.getItem('fh_cart_local')||'[]'); // fallback only

  // If you are using server cart, this function will be called after that data is loaded.
  // We'll build based on localStorage fallback for older behavior.
  cart.forEach((carts) => {
    let isFound = resIds.some(r => r.res_id == carts.restaurant_id);
    if(!isFound) {
      const index = Restaurants.findIndex(res => res.restaurant_id == carts.restaurant_id);
      const r = Restaurants[index] || {};
      resIds.push({
        res_id: carts.restaurant_id,
        rating: r.rating || 0,
        source: r.image || r.source || 'Images/Restaurants_Images/placeholder.jpg',
        name: r.name || 'Restaurant'
      });
    }
  });

  resIds.forEach((r) => {
    let total = 0;
    cart.forEach((carts) => {
      if(r.res_id == carts.restaurant_id) total += carts.quantity*carts.price;
    });

    html += `
      <div class="All-carts-2-a">
        <div class="All-carts-2-a-1">
          <div class="All-carts-2-a-11">
            <img src="${r.source}">
            <div>
              <h1>${r.name}</h1>
              <div>
                <img src="Images/Rating-Star.png">
                <p>${r.rating}</p>
              </div>
            </div>
            <i class="fa fa-trash js-trash" data-res-id="${r.res_id}"></i>
          </div>
          <div class="All-carts-2-a-12">
            ${cart.filter(c=>c.restaurant_id==r.res_id).map(c=>`<img src="${c.source || c.image || 'Images/Food_Item_Images/placeholder.jpg'}">`).join('')}
            <p class="js-cart-change" data-res-id="${r.res_id}">+</p>
          </div>
          <div class="All-carts-2-a-13">
            <p class="All-p1">Total</p>
            <p class="All-p2">Rs. ${total}</p>
          </div>
          <div class="All-carts-2-a-14"> 
            <a href="payment.html?resid=${r.res_id}" class="js-checkout-link">Go to Checkout</a>
          </div>
        </div>
      </div>
    `;
  });

  const AllCarts2 = document.querySelector('.js-All-carts-2');
  if(AllCarts2) {
    AllCarts2.innerHTML = html;
    if(html === '') {
      const ecar = document.querySelector('.js-Empty-cart');
      if(ecar) ecar.style.display = "flex";
    }
  }
}

export function cartIconEvent() {
  const cartIcon = document.querySelector('.js-home-cart');
  if(cartIcon) {
    cartIcon.addEventListener('click', () => {
      const AllCa = document.querySelector('.js-All-carts');
      if(AllCa) AllCa.style.display = "flex";
    });
  }
  const cartCross = document.querySelector('.js-cart-cross');
  if(cartCross) cartCross.addEventListener('click', () => {
    const AllCa = document.querySelector('.js-All-carts');
    if(AllCa) AllCa.style.display = "none";
  });

  document.querySelectorAll('.js-cart-change').forEach((events) => {
    events.addEventListener('click', () => {
      let user = JSON.parse(localStorage.getItem('fh_user')||'null');
      const user_id = user ? user.user_id : '';
      let resId = events.dataset.resId;
      window.location.href = `food.html?userid=${user_id}&resid=${resId}`;
    });
  });

  document.querySelectorAll('.js-trash').forEach((events) => {
    events.addEventListener('click', async () => {
      const resId = events.dataset.resId;
      const token = localStorage.getItem('fh_token');
      const cart = JSON.parse(localStorage.getItem('fh_cart_local')||'[]');
      const toRemove = cart.filter(c => String(c.restaurant_id) === String(resId));
      if (token && toRemove.length > 0) {
        for (const c of toRemove) {
          try {
            await fetch('/api/cart/remove', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ item_id: c.item_id })
            });
          } catch (e) { console.error(e); }
        }
        const res = await fetch('/api/cart', { headers: { Authorization: `Bearer ${token}` } }).catch(() => null);
        if (res && res.ok) {
          const data = await res.json();
          const items = data.items || [];
          localStorage.setItem('fh_cart_local', JSON.stringify(items.map(it => ({ ...it, source: it.image }))));
        }
      } else {
        const newCart = cart.filter(c => String(c.restaurant_id) !== String(resId));
        localStorage.setItem('fh_cart_local', JSON.stringify(newCart));
      }
      renderGeneralHTML();
      checkEmpty2();
      window.dispatchEvent(new CustomEvent('cart-updated'));
    });
  });
}

export function checkEmpty2() {
  const AllCarts2 = document.querySelector('.js-All-carts-2');
  if(!AllCarts2) return;
  const html = AllCarts2.innerHTML;
  if(html === '') {
    const ecar = document.querySelector('.js-Empty-cart');
    if(ecar) ecar.style.display = "flex";
  } else {
    const ecar = document.querySelector('.js-Empty-cart');
    if(ecar) ecar.style.display = "none";
  }
}
