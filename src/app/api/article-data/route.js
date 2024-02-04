import { NextResponse } from "next/server";
import { doInsert, doSelect, doUpdate} from "../../../../lib/database";

export async function GET(request) {
    const url = new URL(request.url);

    const articleData = doSelect("citoData", "articles", ["title", "text", "summary", "date", "link"])

    return NextResponse.json({ success: true }, { status: 200 });
}