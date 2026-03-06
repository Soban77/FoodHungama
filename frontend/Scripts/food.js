// Scripts/food.js (API integrated)
import { Restaurants } from "./home.js";
import { cartIconEvent, renderGeneralHTML, checkEmpty2 } from "./general.js";

export let cartServer = []; // cache of cart items from server
export let favouriteServer = []; // cache of favourites from server

let food = [];
let categories = [];

function getToken() {
  return localStorage.getItem('fh_token');
}

async function loadRestaurantDetailsAndItems() {
  const url = new URL(window.location.href);
  const res_id = url.searchParams.get('resid');
  if(!res_id) return;
  // load restaurant is done by home page; here we fetch items
  try {
    const r = await fetch(`/api/items/by-restaurant/${res_id}`);
    food = await r.json();
    // build simple categories from returned items
    const catMap = {};
    food.forEach(f => { if(f.category_name) catMap[f.category_name]=true; });
    categories = Object.keys(catMap).map((n,i)=>({ name:n })); 
    itemAndCategoryHTML();
    renderItemHTML();
  } catch(e) { console.error(e); }

}

export function foodRenderHTML() {
  let html = '';
  const url = new URL(window.location.href);
  const res_id = url.searchParams.get('resid');
  const restaurant = Restaurants.find(r => r.restaurant_id == res_id);
  if(restaurant) {
    html = `
      <div class="food-main-restaurant-img">
        <img src="${restaurant.image || restaurant.source || 'Images/Restaurants_Images/Broadway.webp'}">
      </div>
      <div class="food-main-restaurant-detail">
        <h1>${restaurant.name}</h1>
        <div class="food-main-restaurant-detail-1">
          <img src="Images/Delivery-bike.jpg">
          <p>Rs. 140</p>
        </div>
        <div class="food-main-restaurant-detail-2">
          <img src="Images/Rating-Star.png">
          <p>${restaurant.rating}/5 (<span>1000</span>)</p>
          <a class="js-Review-change">See reviews</a>
        </div>
      </div>`;

      categories.forEach((ct) => {

      if(ct.name == 'Pizza')
      {
        console.log('yes');
        console.log(ct.category_id);
      }

    });
  }
  if(document.querySelector('.js-food-main-restaurant')) document.querySelector('.js-food-main-restaurant').innerHTML = html;

  
}

export function itemAndCategoryHTML() {
  const url = new URL(window.location.href);
  const res_id = url.searchParams.get('resid');
  let html = '';
  let count = 0;
  categories.forEach((cg) => {
    const ct = cg.name;
    let group = '';
    food.forEach(fd => {
      if(fd.category_name === ct) {
        group += `<div class="item-1-container">
            <div class="item-1-container-1">
              <h1>${fd.name}</h1>
              <p class="item-1-container-1-p1">Rs. ${fd.price}</p>
              <p class="item-1-container-1-p2">${fd.description || ''}</p>
            </div>
            <div class="item-1-container-2">
              <img src="${fd.image || fd.source || 'Images/Food_Item_Images/placeholder.jpg'}">
            </div>
            <div class="add-to-cart">
              <div class="add-to-cart-minus js-minus" data-item-id="${fd.item_id}">-</div>
              <div class="add-to-cart-count js-count-${fd.item_id}">0</div>
              <div class="add-to-cart-plus js-plus" data-item-id="${fd.item_id}">+</div>
            </div>
          </div>`;
        count++;
      }
    });
    if(group) {
      html += `<h1>${ct}</h1><div class="food-main-item-1">${group}</div>`;
    }
  });

  if(count !== 0) {
    const start = document.querySelector('.js-food-main-item-start');
    if(start) start.innerHTML = html;
  } else {
    const pay = document.querySelector('.js-food-main-item-2');
    if(pay) pay.style.display = "none";
    const empty = document.querySelector('.js-food-empty-container');
    if(empty) empty.style.display = "flex";
  }

  // bind plus/minus after render
  bindAddRemoveButtons();
}

function bindAddRemoveButtons() {
  document.querySelectorAll('.js-plus').forEach(el => {
    el.addEventListener('click', async () => {
      const itemId = el.dataset.itemId;
      try {
        const token = getToken();
        if(!token) return window.location.href='index.html';
        await fetch('/api/cart/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ item_id: itemId, quantity: 1 })
        });
        await refreshCartFromServer();
      } catch(e) { console.error(e); }
    });
  });

  document.querySelectorAll('.js-minus').forEach(el => {
    el.addEventListener('click', async () => {
      const itemId = el.dataset.itemId;
      try {
        const token = getToken();
        if(!token) return window.location.href='index.html';
        await fetch('/api/cart/remove', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ item_id: itemId })
        });
        await refreshCartFromServer();
      } catch(e) { console.error(e); }
    });
  });
}

export async function renderItemHTML() {
  // render cart items in the right panel
  let html = '';
  let total = 0;
  const url = new URL(window.location.href);
  const res_id = url.searchParams.get('resid');
  const items = cartServer || [];
  items.forEach(ci => {
    if(ci.restaurant_id == res_id) {
      html += `<div class="item-1 js-item-1" data-item-id="${ci.item_id}">
        <img src="${ci.image || ci.source || 'Images/Food_Item_Images/placeholder.jpg'}">
        <div class="item-1-1">
          <p class="item-1-1-p">${ci.name}</p>
          <div class="item-1-1-1">
            <p>Rs. ${ci.price}</p>
            <div class="add-to-cart-1">
              <div class="add-to-cart-count js-count-${ci.item_id}-1">${ci.quantity}</div>
            </div>
          </div>
        </div>
      </div>`;
      // update small counter
      const counter = document.querySelector(`.js-count-${ci.item_id}`);
      if(counter) counter.innerHTML = ci.quantity;
      total += Number(ci.price) * Number(ci.quantity);
    }
  });
  const target = document.querySelector('.js-food-main-item-2-2-start');
  if(target) target.innerHTML = html;
  const totalEl = document.querySelector('.js-total-price');
  if(totalEl) totalEl.innerHTML = total;
}

export async function refreshCartFromServer() {
  try {
    const token = getToken();
    if(!token) return;
    const res = await fetch('/api/cart', { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    const items = data.items || [];
    cartServer = items.map(it => ({
      cart_item_id: it.cart_item_id,
      item_id: it.item_id,
      name: it.name,
      quantity: it.quantity,
      price: it.price,
      restaurant_id: it.restaurant_id,
      image: it.image
    }));
    // Sync to localStorage so cart drawer (general.js) shows server cart
    const forLocal = items.map(it => ({ ...it, source: it.image || 'Images/Food_Item_Images/placeholder.jpg' }));
    try { localStorage.setItem('fh_cart_local', JSON.stringify(forLocal)); } catch (_) {}
    renderGeneralHTML();
    itemAndCategoryHTML();
    renderItemHTML();
    cartIconEvent();
    checkEmpty2();
  } catch(e) { console.error(e); }
}

export function responseFavourite() {
  // toggling favourite uses /api/favourites
  const fav = document.querySelector('.js-food-main-favourite');
  if(!fav) return;
  fav.addEventListener('click', async () => {
    const img = document.querySelector('.js-favourite-image');
    const url = new URL(window.location.href);
    const res_id = url.searchParams.get('resid');
    const token = getToken();
    if(!token) return window.location.href = 'index.html';
    // if already added -> remove (we need favourite id). Simplest: call POST to create, and GET to refresh. If already exists server will create duplicate; in production we'd check by restaurant_id.
    try {
      await fetch('/api/favourites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ restaurant_id: res_id })
      });
      // refresh favourites
      await loadFavourites();
      img.src = "Images/heart-black-empty-icon.jpg";
      document.querySelector('.js-favourite-p').innerText = 'Added to favourites';
    } catch(e) { console.error(e); }
  });
}

export async function loadFavourites() {
  try {
    const token = getToken();
    if(!token) return;
    const r = await fetch('/api/favourites', { headers: { Authorization: `Bearer ${token}` } });
    favouriteServer = await r.json();
  } catch(e) { console.error(e); }
}

export function renderReviewHTML() {
  // keep your previous implementation (UI-only). Reviews can be wired to /api/reviews if needed.
  // ... We'll keep the earlier UI logic you had, no change required for server integration right now.

  
  let cross = document.querySelector('.js-Review-cross');

  if(cross)
  {
    cross.addEventListener('click',() => {

      if(document.querySelector('.js-Review-page'))
      {
        if(document.querySelector('.js-Review-page').style.display === "flex")
        {
          document.querySelector('.js-Review-page').style.display = "none";

          document.querySelector('.js-food-main').style.filter = "brightness(1)";
          document.body.style.background = "none";

          if(document.querySelector('.js-home-nav'))
          {
            document.querySelector('.js-home-nav').style.filter = "brightness(1)";
          }
        }
      }

    });
      
  }

  document.addEventListener('click', (event) => {

    if(document.querySelector('.js-Review-page'))
    {
      if(document.querySelector('.js-Review-page').style.display === "flex")
      {
        const rect = document.querySelector('.js-Review-page').getBoundingClientRect();

        if(event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom)
        {

        }
        else
        {
          document.querySelector('.js-Review-page').style.display = "none";

          document.querySelector('.js-food-main').style.filter = "brightness(1)";
          document.body.style.background = "none";

          if(document.querySelector('.js-home-nav'))
          {
            document.querySelector('.js-home-nav').style.filter = "brightness(1)";
          }
        }
      }
    }

  });

  cross = document.querySelector('.js-Review-cross-2');

  if(cross)
  {
    cross.addEventListener('click',() => {

      if(document.querySelector('.js-Review-page'))
      {
        if(document.querySelector('.js-Review-page').style.display === "flex")
        {
          document.querySelector('.js-Review-page').style.display = "none";

          document.querySelector('.js-food-main').style.filter = "brightness(1)";
          document.body.style.background = "none";

          if(document.querySelector('.js-home-nav'))
          {
            document.querySelector('.js-home-nav').style.filter = "brightness(1)";
          }
        }
      }

    });
      
  }
  
  const Review_Change = document.querySelector('.js-Review-change');

  if(Review_Change)
  {
    Review_Change.addEventListener('click',() => {

      if(document.querySelector('.js-Review-page'))
      {
        document.querySelector('.js-Review-page').style.display = "flex";

        document.querySelector('.js-food-main').style.filter = "brightness(0.6)";
        document.body.style.background = "rgba(0,0,0,0.4)";

        if(document.querySelector('.js-home-nav'))
        {
          document.querySelector('.js-home-nav').style.filter = "brightness(0.6)";
        }

        onlyRenderReview();
      }

    });
  }

  const header_R = document.querySelector('.js-Reviews-page-header-2');
  const header_R2 = document.querySelector('.js-Reviews-page-header-1');
  const main_R = document.querySelector('.js-Review-page');

  if(main_R && header_R && header_R2)
  {
    main_R.addEventListener('scroll', () => {

      if(main_R.scrollTop > 20)
      {
        header_R.style.display = "flex";
        header_R2.style.display = "none";
      }
      else
      {
        header_R2.style.display = "flex";
        header_R.style.display = "none";
      }

    });
  }

  let url2 = new URL(window.location.href);
  let ressd = url2.searchParams.get('resid');

  let Html = '';

  Restaurants.forEach((rest) => {

    if(rest.restaurant_id == ressd)
    {
      let dpa = document.querySelector('.js-Review-page-p');

      if(dpa)
      {
        dpa.innerHTML = rest.name;
      }

      dpa = document.querySelector('.js-Review-rating');

      if(dpa)
      {
        dpa.innerHTML = rest.rating;
      }

      let rting = rest.rating;
      rting = (rting*10);

      let fl = rting%5;

      rting = rting-fl;

      const imr = document.querySelector('.js-Review-img-r');

      if(imr)
      {
        imr.src = `Images/ratings/rating-${rting}.png`;
      }
    }

  });

  const btn = document.querySelector('.js-review-payment-button') || document.querySelector('.js-place-order-button');
  if(btn) {
    btn.addEventListener('click', () => {
      const url = new URL(window.location.href);
      const user = JSON.parse(localStorage.getItem('fh_user')||'null');
      const token = localStorage.getItem('fh_token');
      if(!user || !token) return window.location.href = 'index.html';
      const resid = url.searchParams.get('resid') || '';
      window.location.href = `payment.html?resid=${encodeURIComponent(resid)}`;
    });
  }

  // let html = '';
  // let total = 0;

  // let url = new URL(window.location.href);
  // let res_id = url.searchParams.get('resid');

  // if(cart)
  // {
  //   cart.forEach((carts) => {

  //     if(carts.restaurant_id == res_id)
  //     {
  //       html += `<div class="item-1 js-item-1" data-item-id="${carts.item_id}">
  //                     <img src="${carts.source}">
  //                     <div class="item-1-1">
  //                       <p class="item-1-1-p">${carts.name}</p>
  //                       <div class="item-1-1-1">
  //                         <p>Rs. ${carts.price}</p>
  //                         <div class="add-to-cart-1">
                            
  //                           <div class="add-to-cart-count js-count-${carts.item_id}-1">${carts.quantity}</div>
                            
  //                         </div>
  //                       </div>
  //                     </div>
  //                   </div>`;

  //       if(document.querySelector(`.js-count-${carts.item_id}`))
  //       {
  //         document.querySelector(`.js-count-${carts.item_id}`).innerHTML = carts.quantity;
  //       }

  //       total += carts.price*carts.quantity;
  //     }

  //   });
  // }

  // if(document.querySelector('.js-food-main-item-2-2-start'))
  // {
  //   document.querySelector('.js-food-main-item-2-2-start').innerHTML = html;
  // }
  
  // if(document.querySelector('.js-total-price'))
  // {
  //   document.querySelector('.js-total-price').innerHTML = total;
  // }
  
}

function formatReviewDate(d) {
  if (!d) return '';
  const date = new Date(d);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString();
}

function escapeHtml(s) {
  if (s == null) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

async function loadReviewsForRestaurant(resid) {
  if (!resid) return [];
  try {
    const r = await fetch(`/api/reviews/by-restaurant/${resid}`);
    return await r.json();
  } catch (e) {
    console.error(e);
    return [];
  }
}

function renderReviewsInPanel(reviews, resid) {
  const countEl = document.querySelector('.js-Review-count');
  if (countEl) countEl.textContent = reviews.length;
  const listEl = document.querySelector('.js-Review-list');
  if (!listEl) return;
  const token = getToken();
  const formWrap = document.querySelector('.js-Review-form-wrap');
  if (formWrap) formWrap.style.display = token ? 'block' : 'none';
  if (reviews.length === 0) {
    listEl.innerHTML = '<p class="Review-list-empty">No reviews yet. Be the first to review!</p>';
  } else {
    listEl.innerHTML = reviews.map(rev => `
      <div class="Review-page-div2-1">
        <h1>${escapeHtml(rev.user_name || 'Guest')}</h1>
        <div>
          <span class="Review-card-rating">${rev.rating}/5</span>
          <p>${escapeHtml(formatReviewDate(rev.review_date))}</p>
        </div>
        <p>${escapeHtml(rev.comment || '')}</p>
      </div>
    `).join('');
  }
  const form = document.querySelector('.js-Review-form');
  if (form && token && resid) {
    form.onsubmit = null;
    form.onsubmit = async (e) => {
      e.preventDefault();
      const rating = parseInt(document.querySelector('.js-Review-form-rating').value, 10);
      const comment = (document.querySelector('.js-Review-form-comment').value || '').trim();
      try {
        const r = await fetch('/api/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ restaurant_id: resid, rating, comment: comment || null })
        });
        if (!r.ok) { const d = await r.json().catch(() => ({})); alert(d.error || 'Failed to submit'); return; }
        form.reset();
        const updated = await loadReviewsForRestaurant(resid);
        renderReviewsInPanel(updated, resid);
      } catch (err) {
        console.error(err);
        alert('Network error');
      }
    };
  }
}

function onlyRenderReview() {
  const url2 = new URL(window.location.href);
  const ressd = url2.searchParams.get('resid');
  Restaurants.forEach((rest) => {
    if (rest.restaurant_id == ressd) {
      const dpa = document.querySelector('.js-Review-page-p');
      if (dpa) dpa.textContent = rest.name;
      const ratingEl = document.querySelector('.js-Review-rating');
      if (ratingEl) ratingEl.textContent = rest.rating;
      let rting = Number(rest.rating);
      if (!Number.isNaN(rting)) {
        rting = Math.round(rting * 10) / 10;
        const rtingImg = Math.floor(rting * 10);
        const imr = document.querySelector('.js-Review-img-r');
        if (imr) {
          imr.src = `Images/ratings/rating-${rtingImg}.png`;
          imr.style.display = '';
          imr.onerror = () => { imr.style.display = 'none'; };
        }
      }
    }
  });
  (async () => {
    const reviews = await loadReviewsForRestaurant(ressd);
    renderReviewsInPanel(reviews, ressd);
  })();
}


window.addEventListener('cart-updated', () => { refreshCartFromServer(); });

// init
(async () => {
  await loadRestaurantDetailsAndItems();
  await refreshCartFromServer();
  await loadFavourites();
  foodRenderHTML();
  renderReviewHTML();
  responseFavourite();
})();
