workbox.core.setCacheNameDetails({prefix: "hunarmen_"}); // check the prefix of your app cache and set this accordingly

workbox.core.skipWaiting();

workbox.core.clientsClaim();

self.__precacheManifest = [].concat(self.__precacheManifest || []);
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});
