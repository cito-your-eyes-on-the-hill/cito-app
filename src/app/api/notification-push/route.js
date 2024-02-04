import {NextResponse} from "next/server";
import webpush from "web-push";


webpush.setVapidDetails(
    'mailto:adrielf31@gmail.com', // This should be a contact email
    "BPAtx6LpjenJ8M3MhoCV04GVEcIcRL-N7D1WmyLNcADO3mxv0pefzc9t9417ABbx4IjMPCw_GXfk7ztYBJ2-29c", // public
    "kFoNnsa8grZ76MWsf2yAeSaSxAe0CPxOncYPpSZAx9c", //private
);

export async function GET(request) {
    const url = new URL(request.url);
    const subscription = url.searchParams.get("subscription");
    const payload = url.searchParams.get("payload");

    console.log("RAN")
    console.log("subscription: ", subscription);
    console.log("payload: ", payload);

    if (!subscription || !payload) {
        return NextResponse.json({error: "Invalid request"}, {status: 400});
    }

    sendPushNotification(JSON.parse(subscription), payload);

    return NextResponse.json({success: true}, {status: 200});
}

const sendPushNotification = (subscription, payload) => {
    webpush.sendNotification(subscription, payload)
        .then(response => console.log('Sent push notification:', response))
        .catch(err => console.error('Error sending push notification:', err));
};