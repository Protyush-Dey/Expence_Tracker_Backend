import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";
const connectDb = async()=>{
    try {
        const connectionInstance = mongoose.connect(`${process.env.MONGO_URL}/${DB_NAME}`)
    } catch (error) {
        console.log(`the error is ${error}`)
        process(1)
    }
}
export default connectDb