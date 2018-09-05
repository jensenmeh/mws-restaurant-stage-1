/**
 * Common database helper functions.
 */


//create db
var dbPromise = idb.open('json-db', 1, function(upgradeDb) {
  var keyValStore = upgradeDb.createObjectStore('restaurants', {
    keyPath: 'id'
  });
});

class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/restaurants`;
  }

  static get DATABASE_URL_REVIEWS() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/reviews`;
  }


  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {

    //get all restaurant data from db
    // dbPromise.then(function(db) {
    //   var restaurantsData = db.transaction('restaurants').objectStore('restaurants');
    //   return restaurantsData.getAll().then(function(restaurants) {
    //     if(restaurants.length !== 0) {
    //       callback(null, restaurants);
    //     } else {
    //       fetchRestaurantsData();
    //     }
    //   })
    // });

    fetchRestaurantsData();
    //fetch data from server if db is empty and populate db with restaurant data
    function fetchRestaurantsData() {
      fetch(DBHelper.DATABASE_URL)
      .then(function(response) {
        return response.json();
      })
      .then(function(restaurants) {
        dbPromise.then(function(db) {
          var tx = db.transaction('restaurants', 'readwrite');
          var keyValStore = tx.objectStore('restaurants');
          restaurants.forEach(function(restaurant) {
            keyValStore.put(restaurant);
          });
        });
        console.log(restaurants)
        callback(null, restaurants) || fetchRestaurantReviews(restaurants);
      })
      .catch(function(error) {
        console.log(error.message);
      })   

      
    }

    //fetch reviews data for all restaurants
    function fetchRestaurantReviews(restaurants) {
      fetch(DBHelper.DATABASE_URL_REVIEWS)
      .then(function(response) {
        return response.json();
      })
      .then(function(reviews) {
        // dbPromise.then(function(db) {
        //   var tx = db.transaction('restaurants', 'readwrite');
        //   var keyValStore = tx.objectStore('restaurants');
        //   restaurants.forEach(function(restaurant) {
        //     keyValStore.put(restaurant);
        //   });
        // });

        console.log(reviews);

        restaurants.forEach(function(restaurant, index) {
          restaurant.review = [];
          for(var review of reviews) {
            if(review.restaurant_id === index + 1) {
              restaurant.review.push(review);
            }
          }
        });

        // for(var restaurant of restaurants) {
        //   restaurant.review = [];
        //   var index = Number(restaurant) + 1
        //   for(var review of reviews) {
        //     if(review.restaurant_id = index) {
        //       restaurant.review = review;
        //     }
        //   }
        // }
        //pass all data back to callback
        callback(null, restaurants);

        console.log(restaurants);
      })
      .catch(function(error) {
        console.log(error.message);
      }) 
    }
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    if(restaurant.photograph !== undefined) {
      return (`/img/${restaurant.photograph}`);
    } else {
      return (`/img/${restaurant.id}`);
    };
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }

}
