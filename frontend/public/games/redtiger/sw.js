/*
  Service Worker for RedTiger game scope
  - Intercepts requests and adds Authorization: Bearer & credentials only for cashflowcasino.com hosts
  - Pulls token from a few sources on each request:
      1) self.__STATE__.token set via postMessage from the client (preferred)
      2) IndexedDB (fallback) or Cache Storage (not used here)
      3) URL query (?authToken or ?token) of the controlled page (first install only via message)
  - Notes:
      * SW runs on a separate thread; it cannot directly read window.localStorage/cookies.
      * Ensure the client sends the token to the SW after it becomes available.
*/

const CASHFLOW_HOSTS = new Set(["api.cashflowcasino.com", "cashflowcasino.com"]);

// Shared state inside SW
self.__STATE__ = self.__STATE__ || {
  token: null,
  lastUpdated: 0,
};

// Helper to safely clone and add headers
async function addAuthIfNeeded(request) {
  try {
    const url = new URL(request.url);
    const host = url.hostname;

    if (!CASHFLOW_HOSTS.has(host)) {
      // Not a target host; passthrough
      return request;
    }

    // Only attach if we have a token
    const token = self.__STATE__?.token;
    if (!token) return request;

    // Recreate request with modified headers and credentials
    const headers = new Headers(request.headers);
    if (!headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    // Preserve method/body/mode/referrer etc. Body can be used only once; clone used below.
    const reqInit = {
      method: request.method,
      headers,
      mode: request.mode,
      credentials: "include",
      cache: request.cache,
      redirect: request.redirect,
      referrer: request.referrer,
      referrerPolicy: request.referrerPolicy,
      integrity: request.integrity,
      keepalive: request.keepalive,
      signal: request.signal,
      // Body only for methods that can have one
      body: ["GET", "HEAD"].includes(request.method) ? undefined : await request.clone().blob(),
    };

    // Use the same URL
    return new Request(request.url, reqInit);
  } catch (e) {
    // On any error, return the original request
    return request;
  }
}

// Install/activate basic lifecycle
self.addEventListener("install", (event) => {
  // Activate immediately
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Fetch intercept: patch only for target hosts, otherwise passthrough
self.addEventListener("fetch", (event) => {
  const { request } = event;

  event.respondWith((async () => {
    // Only handle http(s)
    if (!(request.url.startsWith("http://") || request.url.startsWith("https://"))) {
      return fetch(request);
    }

    // Clone and augment if needed
    const patched = await addAuthIfNeeded(request);
    try {
      return await fetch(patched);
    } catch (e) {
      // Network error; rethrow
      throw e;
    }
  })());
});

// Messaging from controlled clients to set/update auth token
// Expected payloads:
//   { type: "SET_AUTH_TOKEN", token: "..." }
//   { type: "INIT_GAME", config: { authToken: "...", ... } }
self.addEventListener("message", (event) => {
  try {
    const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
    if (!data) return;

    if (data.type === "SET_AUTH_TOKEN" && data.token) {
      self.__STATE__.token = data.token;
      self.__STATE__.lastUpdated = Date.now();
    }
    if (data.type === "INIT_GAME" && data.config) {
      const token = data.config.authToken;
      if (token) {
        self.__STATE__.token = token;
        self.__STATE__.lastUpdated = Date.now();
      }
    }
  } catch {
    // Ignore malformed payloads
  }
});