import { Router } from "express";
import { verifyJwtToken } from "../middleware/Auth.middleware.js"; 
import { createExpense } from "../Controller/expense.controller.js";
const router = Router()

router.post("/createExpense" , verifyJwtToken , createExpense)

export default router