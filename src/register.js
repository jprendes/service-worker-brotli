async function unregister() {
    const registrations = await navigator.serviceWorker.getRegistrations();
    return Promise.all(registrations.map(registration => registration.unregister()));
}

export default async function registerServiceWorker(registerFcn) {
    for (let i = 0; i < 1000; ++i) {
        const registration = await registerFcn();
        await navigator.serviceWorker.ready;
        if (navigator.serviceWorker.controller) return registration;
        await unregister();
    }
    throw new Error("Failed to register service worker");
}

if ("serviceWorker" in navigator) {
    const original_register = navigator.serviceWorker.register.bind(navigator.serviceWorker);
    navigator.serviceWorker.register = (...args) => registerServiceWorker(() => original_register(...args));
}