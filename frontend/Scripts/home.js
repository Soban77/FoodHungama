// Scripts/home.js
export let Restaurants = [];

function bindNavClicks() {
  const profileEls = document.querySelectorAll('.js-home-profile');
  profileEls.forEach(el => el.addEventListener('click', () => {
    const user = JSON.parse(localStorage.getItem('fh_user')||'null');
    if(!user) return window.location.href='index.html';
    window.location.href = `options.html?id=${user.user_id}`;
  }));

  const titleEls = document.querySelectorAll('.js-home-title');
  titleEls.forEach(el => el.addEventListener('click', () => {
    const user = JSON.parse(localStorage.getItem('fh_user')||'null');
    const id = user ? user.user_id : '';
    window.location.href = `home.html?id=${id}`;
  }));

  const favEls = document.querySelectorAll('.js-home-favourite');
  favEls.forEach(el => el.addEventListener('click', () => {
    const user = JSON.parse(localStorage.getItem('fh_user')||'null');
    const id = user ? user.user_id : '';
    window.location.href = `favourite.html?id=${id}`;
  }));
}

export async function loadRestaurants() {
  try {
    const res = await fetch('/api/restaurants');
    Restaurants = await res.json();
    homeRenderHTML();
    searching();
  } catch(err) {
    console.error('Failed to load restaurants', err);
  }
}

function homeRenderHTML() {
  let html = '';
  let count = 0;
  Restaurants.forEach((restaurant) => {
    html += `<div class="home-main-restaurants-part1 js-restaurants-part1" data-res-id="${restaurant.restaurant_id}">
          <img src="${restaurant.image || restaurant.source || 'Images/Restaurants_Images/placeholder.jpg'}">
          <div class="home-main-restaurants-part2">
            <p class="home-main-restaurants-part2-1">${restaurant.name}</p>
            <div class="home-main-restaurants-part2-2">
              <img src="Images/Rating-Star.png">
              <p>${restaurant.rating}</p>
            </div>
          </div>
          <div class="home-main-restaurants-part3">
            <img src="Images/Delivery-bike.jpg">
            <p>Rs.140</p>
          </div>
        </div>`;
    count++;
  });

  if(document.querySelector('.js-home-main-restaurants')) {
    document.querySelector('.js-home-main-restaurants').innerHTML = html;
  }
  if(document.querySelector('.js-no-restaurants')) {
    document.querySelector('.js-no-restaurants').innerHTML = count;
  }

  // attach click events
  document.querySelectorAll('.js-restaurants-part1').forEach((resd) => {
    resd.addEventListener('click', () => {
      let user = JSON.parse(localStorage.getItem('fh_user')||'null');
      const id = user ? user.user_id : '';
      const RId = resd.dataset.resId;
      window.location.href = `food.html?userid=${id}&resid=${RId}`;
    });
  });
}

function searching() {
  let search_img = document.querySelector('.js-search-img');
  if(!search_img) return;
  search_img.addEventListener('click', () => {
    let searched = document.querySelector('.js-home-search-input').value.trim().toLowerCase();
    let html = '';
    let count = 0;
    Restaurants.forEach((restaurant) => {
      if(restaurant.name.toLowerCase().includes(searched) || (restaurant.address || '').toLowerCase().includes(searched)) {
        html +=  `<div class="home-main-restaurants-part1 js-restaurants-part1" data-res-id="${restaurant.restaurant_id}">
                    <img src="${restaurant.image || restaurant.source || 'Images/Restaurants_Images/placeholder.jpg'}">
                    <div class="home-main-restaurants-part2">
                      <p class="home-main-restaurants-part2-1">${restaurant.name}</p>
                      <div class="home-main-restaurants-part2-2">
                        <img src="Images/Rating-Star.png">
                        <p>${restaurant.rating}</p>
                      </div>
                    </div>
                    <div class="home-main-restaurants-part3">
                      <img src="Images/Delivery-bike.jpg">
                      <p>Rs.140</p>
                    </div>
                  </div>`;
        count++;
      }
    });
    document.querySelector('.js-home-main-restaurants').innerHTML = html;
    document.querySelector('.js-no-restaurants').innerHTML = count;
    // rebind clicks
    document.querySelectorAll('.js-restaurants-part1').forEach((resd) => {
      resd.addEventListener('click', () => {
        let user = JSON.parse(localStorage.getItem('fh_user')||'null');
        const id = user ? user.user_id : '';
        const RId = resd.dataset.resId;
        window.location.href = `food.html?userid=${id}&resid=${RId}`; 
      });
    });
  });
}

bindNavClicks();
loadRestaurants();
