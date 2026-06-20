import { Router } from "express";
import { verifyJwtToken } from "../../middleware/Auth.middleware";
import {expenseController} from "./expense.controller"

const expenseRouter = Router();

expenseRouter.post("/createExpense" , verifyJwtToken , expenseController.createExpense)
// expenseRouter.delete("/deleteExpense" , verifyJwtToken , expenseController.deleteExpense)
// expenseRouter.get("/getLastTSpend" , verifyJwtToken , expenseController.getThirtySpend)

export default expenseRouter;