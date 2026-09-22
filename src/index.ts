import dotenv from "dotenv";
dotenv.config();

import express, { ErrorRequestHandler } from "express";
import cors from "cors";
import http from "http";
import cookieParser from "cookie-parser";
import { prisma } from "./config/prisma";
import initializeModules from "./Module/main.route";

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || "*", credentials: true }));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// Health check endpoint for Render
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date() });
});

const server = http.createServer(app);
initializeModules(app);

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Something went wrong",
    errors: err.errors || [],
  });
};

app.use(errorHandler);

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log("✅ PostgreSQL (Supabase / Prisma) Connected");

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ DB connection error:", err);
    process.exit(1);
  }
};

startServer();