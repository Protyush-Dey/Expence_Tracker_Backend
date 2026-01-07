import mongoose from "mongoose";
import express from 'express';
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import route from "./Route/ExpencesRoute.js";
dotenv.config()
const app =express();
app.use(bodyParser.json())
app.use(cors())
const PORT = process.env.PORT || 8000;
const MONGOURL = process.env.MONGO_URL

mongoose
.connect(MONGOURL)
.then(() => {
        console.log("DB connected Successfully")
        app.listen(PORT, () => {
            console.log(`server is running on port : ${PORT}`);
        })
    })
    .catch((error) => console.log(error))

    app.use("/api" , route)