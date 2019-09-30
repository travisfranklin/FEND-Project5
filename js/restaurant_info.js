let restaurant;
var newMap;

/**
 * Initialize map as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  initMap();
});

/**
 * Initialize leaflet map
 */
initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      if (navigator.onLine) {
        try {
          self.newMap = L.map('map', {
            center: [restaurant.latlng.lat, restaurant.latlng.lng],
            zoom: 16,
            scrollWheelZoom: false
          });
          L.tileLayer('https://api.mapbox.com/styles/v1/travislf/ck0pmk1kq2kub1cl3w8hztbd1/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoidHJhdmlzbGYiLCJhIjoiY2swcGtydzJ3MDF4YzNjcG9wajg2NHo0aiJ9.0vuTGxRyn8Y2nSTDkxNXKA', {
            mapboxToken: 'pk.eyJ1IjoidHJhdmlzbGYiLCJhIjoiY2swcGtydzJ3MDF4YzNjcG9wajg2NHo0aiJ9.0vuTGxRyn8Y2nSTDkxNXKA',
            maxZoom: 18,
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
              '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
              'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            id: 'mapbox.streets',
          }).addTo(newMap);
          DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
        } catch(error) {
          // error loading map
          console.log("Map couldn't be initialized", error);
          DBHelper.mapOffline();
        }
      } else {
        // we aren't online so map won't load
        DBHelper.mapOffline();
      }
      fillBreadcrumb();
      screenreaderFixes();
    }
  });
};

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
};

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;


  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img';
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.srcset = DBHelper.imageSrcsetForRestaurant(restaurant);
  image.sizes = DBHelper.imageSizesForRestaurant(restaurant);
  image.setAttribute('alt', `Picture of ${restaurant.name}.`);
  image.setAttribute('tabindex', 0);

  const imageMobile = document.getElementById('restaurant-img-mobile');
  imageMobile.src = DBHelper.imageUrlForRestaurant(restaurant);
  imageMobile.setAttribute('alt', `Picture of ${restaurant.name}.`);
  imageMobile.setAttribute('tabindex', 0);


  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  const map = document.getElementById('map');
  map.setAttribute(
    'aria-label',
    `Map showing ${restaurant.name}'s location in ${restaurant.neighborhood} New York.`,
  );

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();
};

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    day.setAttribute('tabindex', 0);
    day.setAttribute('aria-label', `${key}, ${operatingHours[key]}`);
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
};

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h2');
  title.innerHTML = 'reviews';
  title.setAttribute('tabindex', 0);
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    noReviews.setAttribute('tabindex', 0);
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
};

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = `<span>Name:</span>&#9;${review.name}`;
  name.className = 'review-name';
  name.setAttribute('tabindex', 0);
  name.setAttribute('aria-label', `Review by ${review.name}.`);
  li.appendChild(name);

  const date = document.createElement('p');
  date.innerHTML = `<span>Date:</span>&#9;${review.date}`;
  date.className = 'review-date';
  date.setAttribute('tabindex', 0);
  date.setAttribute('aria-label', `reviewed on ${review.date}.`);

  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `<span>Rated:</span>&#9;${review.rating} / 5`;
  rating.className = 'review-rating';
  rating.setAttribute('tabindex', 0);
  rating.setAttribute('aria-label', `Rated ${review.rating} out of 5`);
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  comments.className = 'review-comments';
  comments.setAttribute('tabindex', 0);
  li.appendChild(comments);

  return li;
};

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant = self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
  document.title = `Gourmet | ${restaurant.name} info`;
};

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
};

/**
 * Register service worker only if supported
 */
if (navigator.serviceWorker) {
  navigator.serviceWorker.register('/service-worker.js' , {scope: '/'}).then(function(reg) {
    console.log("Service Worker has been registered successfully!");
  }).catch((e) => {
    console.log("Couldn't register service worker... \n", e);
  });
}

/**
 * Add hide specific elements from screen readers.
 */
hideItemsFromScreenreader = (className) => {
  const items = Array.from(document.getElementsByClassName(className));
  for (item of items) {
    item.setAttribute('aria-hidden', 'true');
    item.setAttribute('tabindex', -1);
  }
};

/**
 * Add accessibility labeling for map copyright.
 */
addMapCopyright = () => {
  const mapAttribution = Array.from(document.getElementsByClassName('leaflet-control-attribution'))[0];
  mapAttribution.setAttribute(
    'aria-label',
    'Leaflet Map Data copyright Open Street Map, CC-BY-SA, Imagery copyright Mapbox',
  );
  mapAttribution.setAttribute('tabindex', 0);
};

/**
 * Run screenreader adjustment functions after site has loaded.
 */
screenreaderFixes = () => {
  hideItemsFromScreenreader('leaflet-control-zoom-in');
  hideItemsFromScreenreader('leaflet-control-zoom-out');
  hideItemsFromScreenreader('leaflet-marker-icon');
  addMapCopyright();
};