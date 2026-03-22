import express, { Request, Response } from "express";
import cors from "cors";
import http from "http";
import  {connectDb} from "./config/mongooseConfig";
import cookieParser from "cookie-parser";

// dot env

const app = express()

// app declareaiton
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(cookieParser());

const server = http.createServer(app);

// connect mongodb
const PORT = process.env.PORT || 8000
connectDb().
then(()=>{
  server.listen(PORT, ()=>{
    console.log(`Ther port is running on: ${PORT}`)
  })
}).catch((err)=>{
    console.log(`DB connection error: ${err}`);
});
