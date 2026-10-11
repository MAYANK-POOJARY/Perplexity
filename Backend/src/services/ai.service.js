import { AIMessage, HumanMessage, SystemMessage } from "langchain";
import { ChatCohere } from "@langchain/cohere";
import { ChatGroq } from "@langchain/groq"
import config from "../config/config.js";


const cohereModel = new ChatCohere({
    model: "command-a-03-2025",
    apiKey: config.COHERE_API_KEY
})

const groqModel = new ChatGroq({
    model: "openai/gpt-oss-120b",
    apiKey: config.GROQ_API_KEY
})


export async function generateResponse(messages){

    console.log("not here")
    const response = await groqModel.invoke(messages.map( msg => {
        if(msg.role === "user") return new HumanMessage(msg.content);
        else if(msg.role === "ai") return new AIMessage(msg.content);
    }));

    return response.text
}


export async function generateChatTitle(message){
    console.log("here it came")
    const response = await cohereModel.invoke([
        new SystemMessage(`You are a helpful assistant that generates concise and descriptive titles for chat conversations.
            User will provide you with the first message of a chat conversation, and you will generate a title that captures the essence of the conversation in 2-4 words. The title should be clear, relevant, and engaging, giving users a quick understanding of the chat's topic.    
        `),
        new HumanMessage(`Generate a title for a chat conversation based on the following first message: ${message}`)
    ]);
    
    return response.text;
}