import { Router } from "express";
import { verifyJwtToken } from "../middleware/Auth.middleware.js"; 
import { createExpense, deleteExpense } from "../Controller/expense.controller.js";
const router = Router()

router.post("/createExpense" , verifyJwtToken , createExpense)
router.delete("/deleteExpense" , verifyJwtToken , deleteExpense)
export default router