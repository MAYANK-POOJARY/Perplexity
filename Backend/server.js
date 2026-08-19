import "dotenv/config"
import app from "./src/app.js"
import connectoDB from "./src/config/database.js"

connectoDB();

app.listen( process.env.Port, ()=>{
    console.log(`Server is running on port ${process.env.Port}.`)
})