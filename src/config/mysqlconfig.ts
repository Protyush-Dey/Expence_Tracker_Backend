import mysql from "mysql2/promise";
import { config } from "./config";

export const connectsql = async () => {
  try {
    console.log("=== MYSQL CONFIG ===");
    console.log("Host:", config.dbHost);
    console.log("User:", config.dbUser);
    console.log("Password:", JSON.stringify(config.dbPassword));
    console.log("Database:", config.dbName);

    const connection = await mysql.createConnection({
      host: config.dbHost,
      user: config.dbUser,
      password: config.dbPassword,
      database: config.dbName,
    });

    console.log("✅ MySQL Connected");
    return connection;
  } catch (error) {
    console.error("❌ MySQL Connection Error:", error);
    throw error;
  }
};

export const db = mysql.createPool({
  host: config.dbHost,
  user: config.dbUser,
  password: config.dbPassword,
  database: config.dbName,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});