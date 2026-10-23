import "dotenv/config"

if(!process.env.MONGO_URI){
   throw new Error("MONGO_URI is not defined in environment variables")
}

if(!process.env.GROQ_API_KEY){
   throw new Error("GROQ_API_KEY is not defined in environment variables")
}

if(!process.env.COHERE_API_KEY){
   throw new Error("COHERE_API_KEY is not defined in environment variables")
}

if(!process.env.JWT_SECRET){
   throw new Error("JWT_SECRET is not defined in environment variables")
}

if(!process.env.GOOGLE_CLIENT_ID){
   throw new Error("GOOGLE_CLIENT_ID is not defined in environment variables")
}

if(!process.env.GOOGLE_CLIENT_SECRET){
   throw new Error("GOOGLE_CLIENT_SECRET is not defined in environment variables")
}

if(!process.env.GOOGLE_REFRESH_TOKEN){
   throw new Error("GOOGLE_REFRESH_TOKEN is not defined in environment variables")
}

if(!process.env.GOOGLE_USER){
   throw new Error("GOOGLE_USER is not defined in environment variables")
}

if(!process.env.TAVILY_API_KEY){
   throw new Error("TAVILY_API_KEY is not defined in environment variables")
}

if(!process.env.IS_PRODUCTION){
   throw new Error("IS_PRODUCTION is not defined in environment variables")
}

if(!process.env.IMAGEKIT_PRIVATE_KEY){
   throw new Error("IMAGEKIT_PRIVATE_KEY is not defined in environment variables")
}

if(!process.env.IMAGEKIT_URL_ENDPOINT){
   throw new Error("IMAGEKIT_URL_ENDPOINT is not defined in environment variables")
}

const config = {
    PORT : process.env.PORT,
    GROQ_API_KEY : process.env.GROQ_API_KEY,
    COHERE_API_KEY : process.env.COHERE_API_KEY,
    MONGO_URI : process.env.MONGO_URI,
    JWT_SECRET : process.env.JWT_SECRET,
    GOOGLE_CLIENT_ID : process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET : process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_REFRESH_TOKEN : process.env.GOOGLE_REFRESH_TOKEN,
    GOOGLE_USER : process.env.GOOGLE_USER,
    TAVILY_API_KEY : process.env.TAVILY_API_KEY,
    CLIENT_URL : process.env.CLIENT_URL || "http://localhost:5173",
    SERVER_URL : process.env.SERVER_URL || "http://localhost:3000",
    IS_PRODUCTION : process.env.NODE_ENV === "production",
    IMAGEKIT_PRIVATE_KEY : process.env.IMAGEKIT_PRIVATE_KEY,
    IMAGEKIT_URL_ENDPOINT : process.env.IMAGEKIT_URL_ENDPOINT,
}

export default config;