import dotenv from "dotenv";
dotenv.config() ;


interface Config {
  mongoUrl: String;
}

export const config: Config = {
  mongoUrl: process.env.MONGO_URL as String,

};
