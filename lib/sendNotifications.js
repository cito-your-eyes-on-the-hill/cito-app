const webpush = require('web-push');

// Configure web-push with your VAPID keys
webpush.setVapidDetails(
    'mailto:adrielf31@gmail.com', // This should be a contact email
    "BPAtx6LpjenJ8M3MhoCV04GVEcIcRL-N7D1WmyLNcADO3mxv0pefzc9t9417ABbx4IjMPCw_GXfk7ztYBJ2-29c", // public
    "kFoNnsa8grZ76MWsf2yAeSaSxAe0CPxOncYPpSZAx9c", //private
);

// Function to send a push notification
export const sendPushNotification = (subscription, payload) => {
    webpush.sendNotification(subscription, payload)
        .then(response => console.log('Sent push notification:', response))
        .catch(err => console.error('Error sending push notification:', err));
};