import mongoose from "mongoose";

export const connectDB = async () => {
    try {
     
        const mongoDB_URI = process.env.MONGODB_URI

        if(!mongoDB_URI){
             throw new Error("MONGODB_URI environment variable is not defined");
        }
        await mongoose.connect(mongoDB_URI)
        console.log("Mongo DB connected")
    } catch (error) {
        console.log("Mongo DB connection fail" , error)
        process.exit(1)
    }
}