const webpush = require('web-push');

// VAPID keys should be generated only once.
const vapidKeys = webpush.generateVAPIDKeys();

webpush.setVapidDetails(
    'mailto:adrielf31@gmail.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
);