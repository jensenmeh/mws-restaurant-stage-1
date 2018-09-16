let restaurant;
var map;

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
}

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
}

/**
 * Get reviews for current restaurant.
 */
fetchReviewsFromURL = (callback) => {
  if (self.reviews) { // restaurant already fetched!
    callback(null, self.reviews)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchReviewsById(id, (error, reviews) => {
      self.reviews = reviews;
      if (!reviews) {
        console.error(error);
        return;
      }
      // fillRestaurantHTML();
      callback(null, reviews)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  image.src = `${DBHelper.imageUrlForRestaurant(restaurant)}.jpg`;
  image.alt = `Image of ${restaurant.name} in ${restaurant.neighborhood}`;

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();

  // create review submission form
  createReviewForm();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = () => {
  fetchReviewsFromURL((error, reviews) => {
    if(error) { // Got an error!
      console.log(error);
    } else {
      const reviews = self.reviews;

      const container = document.getElementById('reviews-container');
      const title = document.createElement('h3');
      title.innerHTML = 'Reviews';
      container.appendChild(title);

      if (!reviews) {
        const noReviews = document.createElement('p');
        noReviews.innerHTML = 'No reviews yet!';
        container.appendChild(noReviews);
        return;
      }
      const ul = document.getElementById('reviews-list');
      reviews.forEach(review => {
        ul.appendChild(createReviewHTML(review));
      });
      container.appendChild(ul);
    }
  });  
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  li.appendChild(name);

  const date = document.createElement('p');
  date.innerHTML = `Last Updated: ${getDate(review.updatedAt)}`;
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  li.setAttribute("tabindex", "0");

  return li;
}

createReviewForm = () => {
  const container = document.getElementById('newReviews-container');
  const title = document.createElement('h3');
  title.innerHTML = 'Leave a Review';
  container.appendChild(title);

  const form = document.createElement('form');
  form.setAttribute('method', "post");
  form.setAttribute('action',"http://localhost:1337/reviews/");

  //create restaurant id input field
  const id = getParameterByName('id');
  const idInput = document.createElement('input');
  idInput.setAttribute('id', "restaurant_id");
  idInput.setAttribute('name', "restaurant_id");
  idInput.setAttribute('type', "hidden");
  idInput.setAttribute('value', id);
  form.appendChild(idInput);

  //create name input field
  const nameDiv = document.createElement('div');
  const nameLabel = document.createElement('label');
  nameLabel.setAttribute('for', "name");
  nameLabel.textContent = "Name: ";
  const nameInput = document.createElement('input');
  nameInput.setAttribute('type', "text");
  nameInput.setAttribute('id', "name");
  nameInput.setAttribute('name', "name");
  nameDiv.appendChild(nameLabel);
  nameDiv.appendChild(nameInput);
  form.appendChild(nameDiv);

  //create rating field
  const ratingDiv = document.createElement('div');
  const ratingLabel = document.createElement('label');
  ratingLabel.setAttribute('for', "rating");
  ratingLabel.textContent = "Rating: ";
  const ratingInput = document.createElement('input');
  ratingInput.setAttribute('type', "text");
  ratingInput.setAttribute('id', "rating");
  ratingInput.setAttribute('name', "rating");
  ratingDiv.appendChild(ratingLabel);
  ratingDiv.appendChild(ratingInput);
  form.appendChild(ratingDiv);


  //create comment field
  const commentDiv = document.createElement('div');
  const commentLabel = document.createElement('label');
  commentLabel.setAttribute('for', "comment");
  commentLabel.textContent = "Comment: ";
  const commentInput = document.createElement('textarea');
  commentInput.setAttribute('id', "comment");
  commentInput.setAttribute('name', "comments");
  commentDiv.appendChild(commentLabel);
  commentDiv.appendChild(commentInput);
  form.appendChild(commentDiv);

  //create submit button
  const submitDiv = document.createElement('div');
  const submitButton = document.createElement('button');
  submitButton.setAttribute('type', "submit");
  submitButton.textContent = "Submit";
  submitDiv.appendChild(submitButton);
  form.appendChild(submitDiv);

  container.appendChild(form);
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

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
}

//format JavaScript default date to something more user friendly
getDate = (date) => {

  date = new Date(date);
  
  const month = ["January",
                 "February",
                 "March",
                 "April",
                 "May",
                 "June",
                 "July",
                 "August",
                 "September",
                 "October",
                 "November",
                 "December"];

  return `${month[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}
