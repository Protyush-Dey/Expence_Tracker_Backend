import { Application } from "express";
import userRouter from "./User/user.route";
import expenseRouter from "./Expense/expense.route";
import splitRouter from "./Split/split.route";
import friendRouter from "./Friend/friend.route";
import accountRouter from "./Account/account.route"

export default function initializeModules(app: Application): void {
    // app.use("/expTrack/user" , userRouter);
    // app.use("/expTrack/expense" , expenseRouter);
    // app.use("/expTrack/account" , accountRouter);
    // app.use("/expTrack/split" , splitRouter);
    // app.use("/expTrack/friend" , friendRouter);
}