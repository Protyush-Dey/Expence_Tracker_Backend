import { Router } from "express";
import { verifyJwtToken } from "../../middleware/Auth.middleware";
import {expenseController} from "./expense.controller"

const expenseRouter = Router();

expenseRouter.post("/createExpense" , verifyJwtToken , expenseController.createExpense)
expenseRouter.delete("/deleteExpense" , verifyJwtToken , expenseController.deleteExpense)

export default expenseRouter;