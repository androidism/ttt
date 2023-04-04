'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "assets/AssetManifest.json": "e2fb29394ecc0571452eb673893d4dfd",
"assets/assets/submitw.wav": "3cadde744bb143d420dff20b5013e597",
"assets/FontManifest.json": "418ee03861ab91540c3d0cc57b3c6988",
"assets/fonts/lucida.ttf": "d7179850bdd2cfaf663c8254ea739e4d",
"assets/fonts/Madani%2520Arabic%2520Black.ttf": "7bd0b666f6fb83ada64596497c0f0df7",
"assets/fonts/Madani%2520Arabic%2520Bold.ttf": "0f6aa89d72ce6d05a3927e51a9495224",
"assets/fonts/Madani%2520Arabic%2520Light.ttf": "0987c73ee7677261edd37a3853224658",
"assets/fonts/Madani%2520Arabic%2520Medium.ttf": "dc5e8181ef5a0d109542e68afe0c95b0",
"assets/fonts/Madani%2520Arabic%2520Regular.ttf": "a8a06922f0cd35fbb53e7664ac9bbe14",
"assets/fonts/MaterialIcons-Regular.otf": "e7069dfd19b331be16bed984668fe080",
"assets/fonts/Tajawal%2520Regular.ttf": "d8304accb48d86d9361ad30569823a0d",
"assets/fonts/tradbdo.ttf": "a1f198485a5d9c7e5c179400cec0bcdb",
"assets/fonts/trado.ttf": "5fdb768036f48f4d90757979d408c8a4",
"assets/images/1.png": "46b40699cf2fdf56ba960e643eabf103",
"assets/images/4.png": "d1723c62f5878c375e2afcfe2b6905ea",
"assets/images/5.png": "cb8bb8f3a955518805d04dada63e9ee3",
"assets/images/888.png": "e952f85b10bb41577ca3ef6df78496cf",
"assets/images/999.png": "f7577949456af2addabd3d8fee91736e",
"assets/lang/ar.json": "5c08ea0f898f6c89df09ca3cff8f90e3",
"assets/lang/en.json": "7f4351a88600951d27f01645703cd6bb",
"assets/NOTICES": "1207c0b6b66d41c50fb2a3c2fa368d9a",
"favicon.png": "230a35ff60974a564eca5dddb27ea142",
"icons/Icon-192.png": "87dcb377d45cb1307f5e5c0f04b58d7e",
"icons/Icon-512.png": "85688d7f815321f205e27ed8eaa9f759",
"icons/Icon-maskable-192.png": "87dcb377d45cb1307f5e5c0f04b58d7e",
"icons/Icon-maskable-512.png": "85688d7f815321f205e27ed8eaa9f759",
"index.html": "dffaacba9c29e7eb859e064e9b9b8c4a",
"/": "dffaacba9c29e7eb859e064e9b9b8c4a",
"main.dart.js": "85996af4ed4c9ba7264e6411d81dadb7",
"manifest.json": "2d23c8a86cd82f235c399901a75ddb6e",
"splash/img/dark-1x.png": "8b463704a5f2308c99b6093a8128cc98",
"splash/img/dark-2x.png": "3d6c378e919b6f45fd4de01c0bb1624e",
"splash/img/dark-3x.png": "e5b2af19e5952acc715139d654f566a5",
"splash/img/dark-4x.png": "c0d062ec9ed945be962e97fb7f84d98f",
"splash/img/light-1x.png": "8b463704a5f2308c99b6093a8128cc98",
"splash/img/light-2x.png": "3d6c378e919b6f45fd4de01c0bb1624e",
"splash/img/light-3x.png": "e5b2af19e5952acc715139d654f566a5",
"splash/img/light-4x.png": "c0d062ec9ed945be962e97fb7f84d98f",
"splash/splash.js": "123c400b58bea74c1305ca3ac966748d",
"splash/style.css": "1021c022e3eed816339bec72aa2f0ca6",
"version.json": "59f0e2a16795da34865625d93c9085c2"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "main.dart.js",
"index.html",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
