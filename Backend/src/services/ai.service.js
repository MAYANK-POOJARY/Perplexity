import config from "../config/config.js";
import { ChatCohere } from "@langchain/cohere";
import { ChatGroq } from "@langchain/groq"
import { searchInternet } from "./internet.service.js";
import { HumanMessage, SystemMessage, AIMessage, tool, ToolMessage } from "langchain";
import * as z from "zod";


const cohereModel = new ChatCohere({
    model: "command-a-03-2025",
    apiKey: config.COHERE_API_KEY
})

const groqModel = new ChatGroq({
    model: "openai/gpt-oss-120b",
    apiKey: config.GROQ_API_KEY
})


const searchInternetTool = tool(
    searchInternet,
    {
        name: "searchInternet",
        description: "Search the internet. ONLY for current or real-time information such as news, weather, prices, scores or recent events. Do NOT use for general knowledge, definitions or explanations.",
        schema: z.object({
            query: z.string().describe("The search query to look up on the internet.")
        })
    }
)


export async function generateChatTitle(message){
    const response = await groqModel.invoke([
        new SystemMessage(`You are a helpful assistant that generates concise and descriptive titles for chat conversations.
            User will provide you with the first message of a chat conversation, and you will generate a title that captures the essence of the conversation in 2-4 words. The title should be clear, relevant, and engaging, giving users a quick understanding of the chat's topic.    
        `),
        new HumanMessage(`Generate a title for a chat conversation based on the following first message: ${message}`)
    ]);
    
    return response.text;
}


// same model, but it knows it is allowed to request the search tool
const modelWithTools = cohereModel.bindTools([ searchInternetTool ])


// safety net: the model may search, read results, search again... never allow an endless loop
const MAX_STEPS = 3


const SYSTEM_PROMPT = `
    You are a helpful and precise assistant.
    Answer directly from your own knowledge for general knowledge, explanations, definitions, concepts, coding, math, writing and casual conversation. Do not search for these.
    Only use the "searchInternet" tool when the answer depends on current or real-time information: news, weather, sports scores, prices, recent events, or anything that may have changed recently. Also use it if the user explicitly asks you to search the web.
    If you can answer confidently without searching, do not search.
    If you don't know the answer and searching can't help, say you don't know.
`

// turns our DB messages ({ role, content }) into LangChain message objects
function buildMessages(messages) {
    return [
        new SystemMessage(SYSTEM_PROMPT),
        ...messages
            .map((msg) => {
                if (msg.role == "user") return new HumanMessage(msg.content)
                if (msg.role == "ai") return new AIMessage(msg.content)
            })
            .filter(Boolean)
    ]
}


// tool arguments sometimes arrive as an object and sometimes as a JSON string
function parseArgs(args) {
    if (typeof args !== "string") return args ?? {}
    try {
        return JSON.parse(args)
    } catch {
        return {}   // malformed: better to search with empty args than to crash the whole answer
    }
}


// NEW way: calls onToken(text) for every small piece of the answer
export async function streamResponse(messages, onToken, signal) {
    const conversation = buildMessages(messages)
    let streamedAny = false

    for (let step = 0; step < MAX_STEPS; step++) {
        // on the final step the model gets NO tools, so it must write a real answer
        const isLastStep = step === MAX_STEPS - 1
        const activeModel = isLastStep ? cohereModel : modelWithTools

        // after a search, start the real answer on a new paragraph
        if (step > 0 && streamedAny) onToken("\n\n")

        let text = ""
        const toolCalls = []

        // 1) stream the model's reply
        const stream = await activeModel.stream(conversation, { signal })

        for await (const chunk of stream) {
            if (chunk.text) {
                text += chunk.text
                streamedAny = true
                onToken(chunk.text)   // goes straight to the user
            }

            // the tool request arrives in tool_call_chunks
            for (const call of chunk.tool_call_chunks ?? []) {
                if (!call.name) continue
                toolCalls.push({
                    name: call.name,
                    id: call.id,
                    args: parseArgs(call.args),
                    type: "tool_call",
                })
            }
        }

        // 2) no tool requested = that was the final answer
        if (toolCalls.length === 0) return

        // 3) the model asked for a search: remember its request, run the tool, remember the result
        conversation.push(new AIMessage({ content: text, tool_calls: toolCalls }))

        for (const call of toolCalls) {
            let result
            try {
                result = await searchInternet(call.args)
            } catch (error) {
                result = "The search failed: " + error.message
            }
            conversation.push(new ToolMessage({ content: result, tool_call_id: call.id }))
        }
        // loop again: the model reads the search results and writes the real answer
    }
}