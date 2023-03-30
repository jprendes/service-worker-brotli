import "service-worker-brotli/register.js";

navigator.serviceWorker.register(new URL(
    // Work around Webpack assigning a hashed names to the service worker
    /* webpackChunkName: "service-worker" */
    "./service-worker.js",
    import.meta.url
), { type: "module" });

document.body.innerHTML = `
    <h1>service-worker-brotli</h1>
    <p>
        A service worker to fetch brotli precompressed assets from CDNs that don't support it.
        See on <a href="https://github.com/jprendes/service-worker-brotli">GitHub</a>.
    </p>
    <p>
        Monitor this page's network activity (e.g., with the Network tab in devtools).
        Then click on the buttons below.
        They should be downloading brotli compressed assets.
    </p>
`;

const downloads = [
    ["Lorem Ipsum (61 KiB)", new URL("./assets/lorem_ipsum.txt", import.meta.url)],
    ["Romeo & Juliet (136 KiB)", new URL("./assets/romeo_juliet.txt", import.meta.url)],
];

const buttons = document.createElement("div");
const title = document.createElement("h3");
const preview = document.createElement("div");

preview.style.setProperty("white-space", "pre-line");
buttons.style.setProperty("display", "flex");
buttons.style.setProperty("gap", "1ex");

for (const [name, link] of downloads) {
    const button = document.createElement("button");
    button.textContent = name;
    button.addEventListener("click", async () => {
        const response = await fetch(link);
        preview.textContent = await response.text();
        title.textContent = name;
    });
    buttons.appendChild(button);
}

document.body.appendChild(buttons);
document.body.appendChild(title);
document.body.appendChild(preview);
