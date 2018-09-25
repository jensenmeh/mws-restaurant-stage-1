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
  nameDiv.setAttribute('id', 'reviewer-name');
  const nameLabel = document.createElement('label');
  nameLabel.setAttribute('for', "name");
  nameLabel.setAttribute('display', "hidden");
  const nameInput = document.createElement('input');
  nameInput.setAttribute('type', "text");
  nameInput.setAttribute('id', "name");
  nameInput.setAttribute('name', "name");
  nameInput.setAttribute('placeholder', "Name");
  nameInput.setAttribute('aria-label', "Name");
  nameDiv.appendChild(nameLabel);
  nameDiv.appendChild(nameInput);
  form.appendChild(nameDiv);

  //create rating selection
  const radioDiv = document.createElement('div');
  radioDiv.setAttribute('id', 'radioDiv');
  for(var i = 1; i <= 5; i++) {
    const radioButton = document.createElement('input');
    radioButton.setAttribute('type', "radio");
    radioButton.setAttribute('id', `rating-${i}`);
    radioButton.setAttribute('name', "rating");
    radioButton.setAttribute('value', i);
    radioButton.classList = "ratingButton";
    const radioLabel = document.createElement('label');
    radioLabel.setAttribute('name', 'rating');
    const radioIcon = document.createElement('i');
    radioIcon.setAttribute('value', `rating-${i}`);
    radioIcon.setAttribute('id', `${i}-star`);
    radioIcon.classList = "far fa-star fa-lg";
    //add event listener to select correct radio button
    radioIcon.addEventListener('click', (event) => {
      for(var i = 0; i < event.srcElement.attributes.length; i++) {
        if (event.srcElement.attributes[i].name === 'value') {
          const ratingId = event.srcElement.attributes[i].value;
          const starRating = document.getElementById(ratingId);
          starRating.checked = true;
        }
      }
      //Change styling to indicate rating selection
      for(var i = 1; i <= 5; i ++) {
        document.getElementById(`${i}-star`).classList = 'far fa-star fa-lg';
      }

      switch (event.srcElement.id) {
        case '5-star':
          document.getElementById('5-star').classList = 'fas fa-star fa-lg';
        case '4-star':
          document.getElementById('4-star').classList = 'fas fa-star fa-lg';
        case '3-star':
          document.getElementById('3-star').classList = 'fas fa-star fa-lg';
        case '2-star':
          document.getElementById('2-star').classList = 'fas fa-star fa-lg';
        case '1-star':
          document.getElementById('1-star').classList = 'fas fa-star fa-lg';
      }
    });
    radioLabel.appendChild(radioIcon);
    radioDiv.appendChild(radioLabel);
    radioDiv.appendChild(radioButton);
  }
  form.appendChild(radioDiv);

  //create comment field
  const commentDiv = document.createElement('div');
  const commentLabel = document.createElement('label');
  commentLabel.setAttribute('for', "comment");
  commentLabel.setAttribute('display', "hidden");
  const commentInput = document.createElement('textarea');
  commentInput.setAttribute('id', "comment");
  commentInput.setAttribute('name', "comments");
  commentInput.setAttribute('placeholder', "Please leave a review!");
  commentInput.setAttribute('aria-label', "Comment-Box");
  commentDiv.appendChild(commentLabel);
  commentDiv.appendChild(commentInput);
  form.appendChild(commentDiv);

  //create submit button
  const submitDiv = document.createElement('div');
  const submitButton = document.createElement('button');
  submitButton.setAttribute('type', "button");
  submitButton.setAttribute('id', "submitButton");
  submitButton.textContent = "Submit";
  submitDiv.appendChild(submitButton);
  form.appendChild(submitDiv);

  container.appendChild(form);

  //add event listener for posting a new review
  createReview();
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

createReview = () => {
  const button = document.getElementById('submitButton');
  button.addEventListener('click', function(event) {
    var data = {};

    const form = event.srcElement.form.elements;
    for(var input of form) {
      if(input.type !== "button") {
        //check if the input is restaurant id
        if(input.name === "restaurant_id") {
          data[input.name] = Number(input.value);
        } else if(input.name === "rating") {
          //check if the input is rating
          if(input.checked === true) {
            data[input.name] = Number(input.value);
          }
        } else {
          //everything else
          data[input.name] = input.value;         
        }

      }
    }

    //create time entries to match format in server
    data['createdAt'] = Date.now();
    data['updatedAt'] = Date.now();

    //pass json object to server
    addReview();

    function addReview() {
      fetch(DBHelper.DATABASE_URL_REVIEWS, {
        method: "POST",
        body: JSON.stringify(data),
        headers:{
          'Content-Type': 'application/json'
        }
      }).then(function(response) {
        return response.json();
      }).then(function(review) {
        //update local idb
        DBHelper.addReview(review);
      }).catch(function(error) {
        if(error.message === "Failed to fetch") {
          setTimeout(() => {
            addReview();
            console.log("Attempting to send review");  
          }, 5000);
        } else {
          console.log(error.message);
        }
      })      
    }

  });
}