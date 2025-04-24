// Updated cache name and assets matching HackQuiz branding
const CACHE_NAME = 'hackquiz-cache-v2';
const urlsToCache = [
	'/',
	'/index.html',
	'/manifest.json',
	'/web-app-manifest-192x192.png',  // Matches manifest icon names
	'/web-app-manifest-512x512.png',  // Matches manifest icon names
	// Add other core assets like main CSS/JS files here
];

// Install event - cache core HackQuiz assets
self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			return cache.addAll(urlsToCache);
		})
	);
});

// Activate event - purge old caches
self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys().then((cacheNames) =>
			Promise.all(
				cacheNames.map((cache) => {
					if (cache !== CACHE_NAME) {
						return caches.delete(cache);
					}
				})
			)
		)
	);
});

// Fetch event with network-first fallback strategy
self.addEventListener('fetch', (event) => {
	event.respondWith(
		caches.match(event.request)
			.then((response) => {
				// Return cached asset if found
				if (response) {
					return response;
				}

				// Clone request for network fetch
				const fetchRequest = event.request.clone();

				return fetch(fetchRequest).then((response) => {
					// Check valid response
					if (!response || response.status !== 200 || response.type !== 'basic') {
						return response;
					}

					// Clone response for caching
					const responseToCache = response.clone();
					caches.open(CACHE_NAME).then((cache) => {
						cache.put(event.request, responseToCache);
					});

					return response;
				});
			})
	);
});