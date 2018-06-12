self.addEventListener('install', function(event) {
	var urlsToCache = [
		'/',
		'js/main.js',
		'js/dbhelper.js',
		'js/restaurant_info.js',
		'css/styles.css',
		'css/responsive.css',
	];

	event.waitUntil(
		caches.open('assets-v1').then(function(cache) {
			return cache.addAll(urlsToCache);
		})
	);
});

self.addEventListener('fetch', function(event) {
	event.respondWith(
		caches.match(event.request).then(function(response) {
			if(response) return response;
			return fetch(event.request);
		})
	)
});