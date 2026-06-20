import dotenv from "dotenv";
dotenv.config();

console.log("==> MONGO_URL:", process.env.MONGO_URL ? "Found" : "Missing");
console.log("==> PORT:", process.env.PORT);

import express, { ErrorRequestHandler } from "express";

import cors from "cors";
import http from "http";
import cookieParser from "cookie-parser";
import { connectDb } from "./config/mongooseConfig";

import initializeModules from "./Modulecopy/main.route"
import { connectsql } from "./config/mysqlconfig";

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

const server = http.createServer(app);
initializeModules(app);


const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Something went wrong",
    errors: err.errors || [],
  });
};

app.use(errorHandler); 


const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDb();
    await connectsql();

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log("✅ MongoDB Connected");
      console.log("✅ MySQL Connected");
    });
  } catch (err) {
    console.error("❌ DB connection error:", err);
    process.exit(1);
  }
};

startServer();