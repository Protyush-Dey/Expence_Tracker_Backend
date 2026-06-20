import { Application } from "express";
// console.log("==> importing userRouter");
 import userRouter from "./User/user.route";
// // console.log("==> importing expenseRouter");
import expenseRouter from "./Expense/expense.route";
// // console.log("==> importing splitRouter");
// import splitRouter from "./Split/split.route";
// // console.log("==> importing friendRouter");
// import friendRouter from "./Friend/friend.route";
// // console.log("==> importing accountRouter");
import accountRouter from "./Account/account.route";
// // console.log("==> all routers imported");

export default function initializeModules(app: Application): void {
    try {
        app.use("/expTrack/user" , userRouter);
        app.use("/expTrack/expense" , expenseRouter);
        app.use("/expTrack/account" , accountRouter);
        // app.use("/expTrack/split" , splitRouter);
        // app.use("/expTrack/friend" , friendRouter);
    } catch (error) {
        console.log("main route error" + error)
    }
}