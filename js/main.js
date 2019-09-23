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
  self.newMap = L.map('map', {
        center: [40.722216, -73.987501],
        zoom: 12,
        scrollWheelZoom: false
      });
  L.tileLayer('https://api.mapbox.com/styles/v1/travislf/ck0pmk1kq2kub1cl3w8hztbd1/tiles/256/{z}/{x}/{y}@2x?access_token={mapboxToken}', {
    mapboxToken: 'pk.eyJ1IjoidHJhdmlzZnJhbmtsaW4iLCJhIjoiY2pnbnVtbm11MHd5NTJ4cXN6a3prNDg5byJ9.UPjQTVt3nna-nejnj2eXDA',
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
      '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
      'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox.streets',
  }).addTo(newMap);

  updateRestaurants();
};
// window.initMap = () => {
//   let loc = {
//     lat: 40.722216,
//     lng: -73.987501
//   };
// self.map = new google.maps.Map(document.getElementById('map'), {
//   zoom: 12,
//   center: loc,
//   scrollwheel: false
// });
//   updateRestaurants();
// };

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


  let chooseGradient = function getit() {
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
  gradient.className = 'gradient-mask';
  picture.className = 'restaurant-img';
  source.srcset = '';
  source.media = '(min-width: 465px)';
  source.type = 'image/jpg';
  img.src = DBHelper.imageUrlForRestaurant(restaurant);
  entryBox.className = 'entry-box';
  name.innerHTML = restaurant.name;
  neighborhood.className = 'neighborhood-label';
  neighborhood.innerHTML = restaurant.neighborhood;
  address.innerHTML = restaurant.address;
  more.innerHTML = 'View Details ';

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
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.newMap);
    marker.on("click", onClick);
    function onClick() {
      window.location.href = marker.options.url;
    }
    self.markers.push(marker);
  });
};
// addMarkersToMap = (restaurants = self.restaurants) => {
//   restaurants.forEach(restaurant => {
//     // Add marker to the map
//     const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
//     google.maps.event.addListener(marker, 'click', () => {
//       window.location.href = marker.url;
//     });
//     self.markers.push(marker);
//   });
// };

document.getElementById('restaurant-wrapper').click(function() {
  window.location = document.querySelector(this).querySelector("a").attr("href");
  return false;
});
