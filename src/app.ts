import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
const app = express()
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(cookieParser());

import userRoute from "./routes/user.route.ts"
app.use("/user" , userRoute);
import accountRoute from "./routes/account.route.ts"
app.use("/account" , accountRoute);
import expenseRoute from "./routes/expense.route.ts"
app.use("/expense" , expenseRoute);
import friendRoute from "./routes/friend.route.ts"
app.use("/friend" , friendRoute);
import splitRoute from "./routes/split.route.ts"
app.use("/split" , splitRoute);
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error"
  })
})
export {app}