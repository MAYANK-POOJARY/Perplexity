import mongoose from "mongoose";

async function connectoDB(){
    try{
        await mongoose.connect(process.env.MONGO_URI)
        .then(()=>{
            console.log("MongoDB connected successfully.")
        })
    }catch(error){
        console.error("MongoDB connection failed.", error);
        process.exit(1);
    }
}

export default connectoDB;