let restaurants;
let neighborhoods;
let cuisines;
var newMap;
var markers = [];


/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  initMap(); // added
  fetchNeighborhoods();
  fetchCuisines();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
};

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
};

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
};

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach((cuisine) => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
};

/**
 * Initialize leaflet map, called from HTML.
 */

initMap = () => {
  if (navigator.onLine) {
    try {
      self.newMap = L.map('map', {
              center: [40.722216, -73.987501],
              zoom: 12,
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

        // once map is loaded, screenreader fixes can be initiated.
        screenreaderFixes();
    } catch {
      // error during map load
      console.log("Map couldn't be initialized", error);
      DBHelper.mapOffline();
    }
  } else {
    // we aren't online so loading map won't work
    DBHelper.mapOffline();
  }
  updateRestaurants();

};

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  });
};

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  if (self.markers) {
    self.markers.forEach(marker => marker.remove());
  }
  self.markers = [];
  self.restaurants = restaurants;
};

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
};

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {

  const gradient1 = 'linear-gradient(to right, #f12711bb, #f5af19bb)';
  const gradient2 = 'linear-gradient(to right, #00b4dbbb, #0083b0bb)';
  const gradient3 = 'linear-gradient(to right, #7f00ffbb, #e100ffbb)';
  const gradient4 = 'linear-gradient(to right, #aaaaccdd, #aaaaccbb)';
  const gradients = [gradient1, gradient2, gradient4, gradient4, gradient4, gradient4];


  let chooseGradient = () => {
    const x = Math.floor(Math.random() * gradients.length);
    return gradients[x];
  };

  const li = document.createElement('li');
  const a = document.createElement('a');
  const gradient = document.createElement('div');
  const picture = document.createElement('picture');
  const source = document.createElement('source');
  const img = document.createElement('img');
  const entryBox = document.createElement('div');
  const name = document.createElement('h2');
  const neighborhood = document.createElement('p');
  const address = document.createElement('p');
  const more = document.createElement('a');

  a.className = 'restaurant-wrapper';
  a.href = DBHelper.urlForRestaurant(restaurant);
  a.setAttribute('aria-label', `${restaurant.name}. ${restaurant.neighborhood} at ${restaurant.address}. View details.`);
  gradient.className = 'gradient-mask';
  gradient.setAttribute('aria-hidden', 'true');
  picture.className = 'restaurant-img';
  picture.setAttribute('aria-hidden', 'true');
  source.type = 'image/jpg';
  source.setAttribute('aria-hidden', 'true');
  img.src = DBHelper.imageUrlForRestaurant(restaurant);
  img.srcset = DBHelper.imageSrcsetForRestaurant(restaurant);
  img.sizes = DBHelper.imageSizesForRestaurant(restaurant);  source.media = '(min-width: 465px)';
  img.setAttribute('aria-hidden', 'true');
  entryBox.className = 'entry-box';
  entryBox.setAttribute('aria-hidden', 'true');
  name.innerHTML = restaurant.name;
  name.setAttribute('aria-hidden', 'true');
  neighborhood.className = 'neighborhood-label';
  neighborhood.innerHTML = restaurant.neighborhood;
  neighborhood.setAttribute('aria-hidden', 'true');
  address.innerHTML = restaurant.address;
  address.setAttribute('aria-label', `address for ${restaurant.name}:`);
  more.innerHTML = 'View Details ';
  more.setAttribute('aria-hidden', 'true');

  li.append(a);
  a.append(gradient);
  gradient.style.background = chooseGradient();
  a.append(entryBox);
  a.append(picture);
  picture.append(source);
  picture.append(img);
  entryBox.append(neighborhood);
  entryBox.append(name);
  entryBox.append(address);
  entryBox.append(more);

  return li;
};

/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
  // if either newMap or L (leaflet) aren't defined exit early.
  if (!newMap || !L) return;
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.newMap);
    marker.on("click", () => {
      window.location.href = marker.options.url;
    });
    self.markers.push(marker);
  });
};

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
    'Leaflet Map Data copyright Open Street Map, CC-BY-SA, Imagery copyright Mapbox'
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

// Register service worker only if supported
if (navigator.serviceWorker) {
  navigator.serviceWorker.register(`/FEND-Project5/service-worker.js` , {scope: '/FEND-Project5/'}).then((reg) => {
    console.log("Service Worker has been registered successfully!");
  }).catch((e) => {
    console.log("Couldn't register service worker... \n", e);
  });
}
