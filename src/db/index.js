import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";
const connectDb = async()=>{
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URL}/${DB_NAME}`)
        console.log(`MongoDB connected: ${connectionInstance.connection.name}`);
    } catch (error) {
        console.log(`the error is ${error}`)
        process.exit(1)
    }
}
export default connectDb