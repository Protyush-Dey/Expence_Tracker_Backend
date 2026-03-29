import dotenv from "dotenv";
dotenv.config();

console.log("==> Step 1: dotenv loaded");
console.log("==> MONGO_URL:", process.env.MONGO_URL ? "Found ✅" : "Missing ❌");
console.log("==> PORT:", process.env.PORT);

import express from "express";
console.log("==> Step 2: express loaded");

import cors from "cors";
import http from "http";
import cookieParser from "cookie-parser";
import { connectDb } from "./config/mongooseConfig";
console.log("==> Step 3: connectDb loaded");

import initializeModules from "./Module/main.route";
console.log("==> Step 4: modules loaded");

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

const server = http.createServer(app);
initializeModules(app);

const PORT = process.env.PORT || 4000;
console.log("==> Step 5: about to connect DB, PORT =", PORT);

connectDb()
  .then(() => {
    console.log("==> Step 6: DB connected!");
    server.listen(PORT, () => {
      console.log(`==> Step 7: Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(`==> DB connection error: ${err}`);
    process.exit(1);
  });