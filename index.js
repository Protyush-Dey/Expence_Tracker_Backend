import mongoose from "mongoose";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import route from "./Route/ExpencesRoute.js";

dotenv.config();

const app = express();

// middlewares
app.use(bodyParser.json());
app.use(cors());

// routes (must be BEFORE listen)
app.use("/api", route);

// env vars
const PORT = process.env.PORT || 8000;
const MONGOURL = process.env.MONGO_URL;

console.log("PORT:", PORT);
console.log("MONGO URL FOUND:", MONGOURL ? "YES" : "NO");

// mongodb connection
mongoose
  .connect(MONGOURL)
  .then(() => {
    console.log("DB connected Successfully");
    app.listen(PORT, () => {
      console.log(`server is running on port : ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error ❌", error.message);
    process.exit(1);
  });
