import dotenv from "dotenv";

dotenv.config();

interface Config {
  mongoUrl: string;

  dbHost: string;
  dbUser: string;
  dbPassword: string;
  dbName: string;

  mongoPort: number;
  sqlPort: number;
}

export const config: Config = {
  mongoUrl: process.env.MONGO_URL || "",

  dbHost: process.env.DB_HOST || "127.0.0.1",
  dbUser: process.env.DB_USER || "root",
  dbPassword: process.env.DB_PASSWORD || "",
  dbName: process.env.DB_NAME || "",

  mongoPort: Number(process.env.MONGO_PORT) || 3000,
  sqlPort: Number(process.env.SQL_PORT) || 4000,
};

console.log(
  "==> MONGO_URL:",
  config.mongoUrl ? "Found ✅" : "Missing ❌"
);

console.log("==> DB_NAME:", config.dbName);