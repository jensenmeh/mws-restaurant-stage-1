self.addEventListener('install', function(event) {
	var urlsToCache = [
		'/',
		'/restaurant.html',
		'/index.html',
		'js/main.js',
		'js/dbhelper.js',
		'js/restaurant_info.js',
		'css/styles.css',
		'css/all.min.css',
		'webfonts/fa-regular-400.woff2',
		'webfonts/fa-solid-900.woff2'
	];

	event.waitUntil(
		caches.open('assets-v1').then(function(cache) {
			return cache.addAll(urlsToCache);
		})
	);
});

self.addEventListener('fetch', function(event) { 
	const requestUrl = new URL(event.request.url);

	//serve restaurant page if url starts with restaurant.html
	if(requestUrl.pathname.startsWith('/restaurant.html')) {
		event.respondWith(caches.match('/restaurant.html'))
	} else {
		//check all other cache items; else go fetch from the network
		event.respondWith(
			caches.match(event.request).then(function(response) {
				if(response) return response;
				return fetch(event.request);
			})
		)
	}
});