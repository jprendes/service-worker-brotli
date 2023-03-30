import BrotliDecTransformStream from "./BrotliDecTransformStream.js";
import mime from "mime/lite";

export function makeUrl(url) {
    url = new URL(url);
    url.pathname += ".br";
    return url;
}

export function makeRequest(request, opts = {}) {
    const url = makeUrl(request.url);
    return new Request(url, {
        ...request,
        mode: request.mode === "navigate" ? "same-origin" : request.mode,
        ...opts,
    });
}

export function makeResponse(response) {
    if (!response.ok) return response;

    const url = new URL(response.url);
    const pathname = url.pathname.slice(0,-3);
    const mimetype = mime.getType(pathname) || "application/octet-stream";

    const body = response.body.pipeThrough(new BrotliDecTransformStream());
    return new Response(body, { headers: {
        "Content-Type": mimetype,
        "X-BrotliDecPlugin": "1",
    } });
}
