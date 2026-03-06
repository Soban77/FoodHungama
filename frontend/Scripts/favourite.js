// Scripts/favourite.js (reads favourites from server and render)
import { cartIconEvent } from "./general.js";

async function renderFavouriteHTML() {
  const token = localStorage.getItem('fh_token');
  if(!token) return window.location.href = 'index.html';
  try {
    const res = await fetch('/api/favourites', { headers: { Authorization: `Bearer ${token}` }});
    const favs = await res.json();
    let html = '';
    const restaurantsRes = await fetch('/api/restaurants');
    const restaurants = await restaurantsRes.json();
    if(favs.length === 0) {
      document.querySelector('.js-No-favourite-container').style.display = 'flex';
      return;
    }
    favs.forEach((fav) => {
      const resObj = restaurants.find(r => r.restaurant_id == fav.restaurant_id);
      if(resObj) {
        html += `<div class="home-main-restaurants-part1 js-restaur" data-res-id="${resObj.restaurant_id}">
              <img src="${resObj.image || resObj.source || 'Images/Restaurants_Images/placeholder.jpg'}">
              <div class="home-main-restaurants-part2">
                <p class="home-main-restaurants-part2-1">${resObj.name}</p>
                <div class="home-main-restaurants-part2-2">
                  <img src="Images/Rating-Star.png">
                  <p>${resObj.rating}</p>
                </div>
              </div>
              <div class="home-main-restaurants-part3">
                <img src="Images/Delivery-bike.jpg">
                <p>Rs.140</p>
              </div>
            </div>`;
      }
    });
    document.querySelector('.js-favourite-restaurants').innerHTML = html;
    // bind navigation
    document.querySelectorAll('.js-restaur').forEach((resd) => {
      resd.addEventListener('click', () => {
        let user = JSON.parse(localStorage.getItem('fh_user')||'null');
        const id = user ? user.user_id : '';
        const RId = resd.dataset.resId;
        window.location.href = `food.html?userid=${id}&resid=${RId}`; 
      });
    });
    cartIconEvent();
  } catch(e) { console.error(e); }
}

renderFavouriteHTML();
