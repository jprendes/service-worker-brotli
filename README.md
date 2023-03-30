# service-worker-brotli

A service worker to fetch brotli precompressed assets from CDNs that don't support it.

The service worker implements a _network-first_ strategy for `text/html` assets, and a _cache-first_ strategy for all other assets.

# Motivation

In many CDNs you can upload a precompressed `gzip` versions of a file.
They will then serve the compressed file if the client supports it.
This saves bandwidth and time.

Most browsers nowadays also support [brotli](https://www.brotli.org/) compression which results in even smaller files.
However, not many CDNs support serving precompressed `brotli` files.

This library implements a service worker to workaround that issue.

# Quick start

Install the package
```sh
npm install service-worker-brotli
```

Create a `service-worker.js` file for your service worker
```javascript
import "service-worker-brotli";
```

Finally, register the worker in your `index.js`
```javascript
import "service-worker-brotli/register.js";

navigator.serviceWorker.register(new URL("./service-worker.js", import.meta.url), { type: "module" });

// the rest of your code
```

See the `demo` folder for an example for `webpack` and `parcel`.

## The `register.js` import

By default a service worker will not control the page after a hard refresh and all `fetch`es will go straight to the network.
That means requesting potentially large uncompressed asset files from the server.
This import patches `navigator.serviceWorker.register` to allow the service worker to control the page even after a hard refresh.

## The `utils.js` import

The default `service-worker-brotli` import implements a _network-first_ strategy for `text/html` assets, and a _cache-first_ strategy for all other assets. It implements no pre-caching.

This works nicely with bundlers where the `html` entry points are not hashed, while the rest of the assets are hashed.

If you need more control over the service worker or you already have a service worker, you can import `service-worker-brotli/utils.js` which provides the `makeRequest` and `makeResponse` functions.

For example, if you are using `Workbox` you can create a plugin to handle the compression

```javascript
import { registerRoute } from 'workbox-routing';
import { CacheFirst } from 'workbox-strategies';
import { makeRequest, makeResponse } from "service-worker-brotli/utils.js";

class BrotliPlugin {
    requestWillFetch({ request }) {
        // Make a request to the brotli compressed asset.
        return makeRequest(request);
    }

    fetchDidSucceed({ response }) {
        if (!response.ok) return response;

        // Make a response that:
        // * decompresses the asset on the fly.
        // * fixes the Content-Type header based on
        //   the asset extension.
        return makeResponse(response);
    }
};

registerRoute(
    new RegExp("/assets/.*"),
    new CacheFirst({ plugins: [
        new BrotliPlugin()
    ] })
);

```