import { NextResponse } from "next/server";
import { doInsert, doSelect, doUpdate} from "../../../../lib/database";

export async function GET(request) {
    const url = new URL(request.url);

    const articleData = await doSelect("citoData", "Articles", ["title", "text", "summary", "date", "link", "classifierNumber"])

    console.log("articleData: ", articleData)

    return NextResponse.json({ articleData }, { status: 200 });
}