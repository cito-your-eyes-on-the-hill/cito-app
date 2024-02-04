import { doSelect} from "./database";

export const articleData = doSelect("citoData", "articles", ["title", "text", "summary", "date", "link"])

