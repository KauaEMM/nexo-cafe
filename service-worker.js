"use strict";

const CACHE_NAME = "nexo-cafe-v1";

const CORE_ASSETS = [
    "./",
    "./index.html",
    "./css/style.css",
    "./js/script.js",
    "./favicon.svg",
    "./manifest.json"
];


/* =========================================================
   INSTALL
   ========================================================= */

self.addEventListener("install", event => {

    event.waitUntil(

        caches
            .open(CACHE_NAME)
            .then(cache => cache.addAll(CORE_ASSETS))

    );

    self.skipWaiting();

});


/* =========================================================
   ACTIVATE
   ========================================================= */

self.addEventListener("activate", event => {

    event.waitUntil(

        caches
            .keys()
            .then(keys => {

                return Promise.all(

                    keys
                        .filter(key => key !== CACHE_NAME)
                        .map(key => caches.delete(key))

                );

            })

    );

    self.clients.claim();

});


/* =========================================================
   FETCH
   ========================================================= */

self.addEventListener("fetch", event => {

    /*
     * Apenas requisições GET.
     */

    if (event.request.method !== "GET") {
        return;
    }

    /*
     * Não interceptamos URLs externas.
     * Ex.: Google Fonts.
     */

    const url =
        new URL(event.request.url);

    if (
        url.origin !== self.location.origin
    ) {
        return;
    }


    event.respondWith(

        caches
            .match(event.request)
            .then(cachedResponse => {

                if (cachedResponse) {
                    return cachedResponse;
                }

                return fetch(event.request)
                    .then(response => {

                        /*
                         * Só armazenamos respostas válidas.
                         */

                        if (
                            !response ||
                            response.status !== 200 ||
                            response.type !== "basic"
                        ) {
                            return response;
                        }

                        const clonedResponse =
                            response.clone();

                        caches
                            .open(CACHE_NAME)
                            .then(cache => {

                                cache.put(
                                    event.request,
                                    clonedResponse
                                );

                            });

                        return response;

                    });

            })

    );

});
