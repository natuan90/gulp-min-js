if ('serviceWorker' in navigator) {
    // unregister old service workers
    navigator.serviceWorker.getRegistrations().then(function (registrations) {
        registrations.forEach(function (registration) {
            registration.unregister();
        });
    });

    window.addEventListener('load', function () {
        navigator.serviceWorker
            .register('/air/sw.js', {scope: "/"})
            .then(function (registration) {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            }, function (err) {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}
