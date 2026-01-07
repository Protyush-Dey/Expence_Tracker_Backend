import{addAllExpense} from "../Controller/ExpenseController.js"
import express from "express"
const route = express.Router();
route.post("/add" , addAllExpense)

export default route