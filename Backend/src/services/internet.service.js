import { tavily as Tavily } from "@tavily/core";
import config from "../config/config.js";

const tavily = Tavily({
    apiKey: config.TAVILY_API_KEY
})

export const searchInternet = async ({ query }) => {
    console.log("came here")
    const results = await tavily.search(query, {
        maxResults: 5,
    })

    return JSON.stringify(results)
}