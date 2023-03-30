import { makeRequest, makeResponse } from "./utils.js";

const cacheName = `cache v1 (${self.registration.scope})`;

async function do_plain_match(request) {
    const cache = await caches.open(cacheName);
    const response = await cache.match(request);
    if (!response) throw new Error("Match not found");
    return response;
}

async function do_plain_fetch(request) {
    const response = await fetch(request);
    if (request.method === "GET") {
        const cache = await caches.open(cacheName);
        cache.put(request, response.clone());
    }
    return response;
}

async function do_brotli_match(request) {
    request = makeRequest(request);
    const response = await do_plain_match(request);
    return makeResponse(response);
}

async function do_brotli_fetch(request) {
    request = makeRequest(request);
    const response = await do_plain_fetch(request);
    if (!response.ok) throw new Error("Compressed asset not found");
    return makeResponse(response);
}

async function do_match(request) {
    try {
        return await do_plain_match(request);
    } catch {
        return await do_brotli_match(request);
    }
}

async function do_fetch(request) {
    try {
        return await do_brotli_fetch(request);
    } catch {
        return await do_plain_fetch(request);
    }
}

async function handle_fetch(request) {
    try {
        // In general, we want to try the cache first
        const response = await do_match(request);
        if (response?.headers?.get("Content-Type")?.startsWith("text/html")) {
            // but for html (entry points) we want to try the network first.
            return do_fetch(request).catch(() => response);
        }
        return response;
    } catch (e) {
        return do_fetch(request);
    }
};

self.addEventListener("activate", (event) => {
    event.waitUntil(self.clients.claim().catch(() => {}));
});

self.addEventListener("install", (event) => {
    self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
    const { request } = event;
    const url = new URL(request.url);

    if (!url.protocol.startsWith("http")) return;
    if (request.method !== "GET") return;
    if (request.mode === "websocket") return;

    event.respondWith(handle_fetch(request));
});
