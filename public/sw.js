self.addEventListener('push', function(event) {
    const payload = event.data ? event.data.text() : 'No payload';
    console.log("payload: ", payload)
    event.waitUntil(
        self.registration.showNotification('Notification', {
            body: payload,
        })
    );
});
