import { Router } from "express";
import { verifyJwtToken } from "../middleware/Auth.middleware.js";
import {createAccount, getAllAccountDetails, getMonthExpenseOfAccount, getExpenseOfAccountByDates,deleteAccount} from "../Controller/account.controller.js" 
const router = Router()

router.post("/createAccount" , verifyJwtToken , createAccount)
router.get("/getAllAccountDetails" , verifyJwtToken , getAllAccountDetails)
router.get("/getMonthExpenseOfAccount/:accountNo" , verifyJwtToken , getMonthExpenseOfAccount)
router.get("/getExpenseOfAccountByDates/:accountNo" , verifyJwtToken , getExpenseOfAccountByDates)
router.delete("/deleteAccount/:accountNo" , verifyJwtToken , deleteAccount)
export default router