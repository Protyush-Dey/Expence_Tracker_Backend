import mongoose from "mongoose";
import { config } from "./config";
import { DB_NAME } from "../constant";


export const connectDb = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${config.mongoUrl}/${DB_NAME}`,
    );
    console.log(`MongoDB connected: ${connectionInstance.connection.name}`);
  } catch (error) {
    console.log(`the error is ${error}`);
    process.exit(1);
  }
};
