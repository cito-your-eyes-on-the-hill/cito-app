import { NextResponse } from "next/server";
import { doInsert, doSelect, doUpdate} from "../../../../lib/database";

export async function GET(request){
    const { userInfo } = new URL(request.url);

    console.log(userInfo)
    console.log("Made it here")

    const url = new URL(request.url);
    const deviceID = url.searchParams.get("deviceID");
    const zipCode = url.searchParams.get("zipCode");

    if (!deviceID || !zipCode) {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Check if phone already has a zip code
    const existingZip = await doSelect("citoData", "devices", ["ZipCode"], { DeviceID: deviceID });

    if(existingZip.length > 0){
        await doUpdate("citoData", "devices", { ZipCode: zipCode }, { DeviceID: deviceID });
    }
    else{
        // Insert the user into the database
        await doInsert("citoData", "devices", { DeviceID: deviceID, ZipCode: zipCode });
    }

    return NextResponse.json({ success: true }, { status: 200});
}