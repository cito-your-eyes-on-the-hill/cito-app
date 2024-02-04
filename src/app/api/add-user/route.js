import { NextResponse } from "next/server";
import { doInsert, doSelect, doUpdate} from "../../../../lib/database";

export async function GET(request) {
    const url = new URL(request.url);
    console.log("url: ", url)
    const deviceID = url.searchParams.get("deviceID");
    const zipCode = url.searchParams.get("zipCode");
    const subscription = url.searchParams.get("subscription"); // New parameter

    console.log("deviceID: ", deviceID);
    console.log("zipCode: ", zipCode);
    console.log("subscription: ", subscription);

    if (!deviceID || !zipCode || !subscription) {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const existingZip = await doSelect("citoData", "devices", ["ZipCode"], { DeviceID: deviceID });

    if(existingZip.length > 0){
        await doUpdate("citoData", "devices", { ZipCode: zipCode, Subscription: subscription }, { DeviceID: deviceID });
    }
    else{
        await doInsert("citoData", "devices", { DeviceID: deviceID, ZipCode: zipCode, Subscription: subscription });
    }

    return NextResponse.json({ success: true }, { status: 200 });
}