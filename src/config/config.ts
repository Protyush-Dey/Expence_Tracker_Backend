interface Config {
  mongoUrl: String;
}
import dotenv from "dotenv";
dotenv.config() 

export const config: Config = {
  mongoUrl: process.env.MONGO_URL as String,

};
