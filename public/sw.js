// Bump when the caching strategy changes — `activate` deletes every other cache,
// so a new name is what evicts stale content from installed clients.
const CACHE_NAME = 'erberfit-v2'

// Relative so they resolve against the scope the worker is registered at
// (/erber-fit-v2/ on GitHub Pages), not the domain root.
const PRECACHE_URLS = [
  './',
  './index.html',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

function cachePut(request, response) {
  if (!response.ok) return
  const clone = response.clone()
  caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
}

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return

  let url
  try {
    url = new URL(request.url)
  } catch {
    return
  }
  // Leave Supabase and font requests to the network.
  if (url.origin !== self.location.origin) return

  const wantsHTML = request.mode === 'navigate' ||
    (request.headers.get('accept') || '').includes('text/html')

  if (wantsHTML) {
    // Network first for the app shell, so a deploy is picked up on the next launch
    // instead of being pinned to whatever was cached first.
    event.respondWith(
      fetch(request)
        .then((response) => {
          cachePut(request, response)
          return response
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('./index.html')))
    )
    return
  }

  // Built assets carry a content hash in the filename, so cache-first is safe here
  // and is what makes the app work in a gym with no signal.
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached
      return fetch(request).then((response) => {
        cachePut(request, response)
        return response
      })
    })
  )
})
