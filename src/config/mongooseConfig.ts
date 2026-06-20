import mongoose from "mongoose";
import { config } from "./config";
import { DB_NAME } from "../constant";

export const connectDb = async () => {
  try {
    console.log("mongourl:", config.mongoUrl);

    const connectionInstance = await mongoose.connect(
      `${config.mongoUrl}/${DB_NAME}`
    );

    console.log(
      `✅ MongoDB Connected: ${connectionInstance.connection.name}`
    );

    return connectionInstance;
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1);
  }
};