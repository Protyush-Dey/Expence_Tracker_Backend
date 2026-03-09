import { Router } from "express";
import { verifyJwtToken } from "../middleware/Auth.middleware.js";
import {createAccount, getAllAccountDetails} from "../Controller/account.controller.js" 
const router = Router()

router.post("/createAccount" , verifyJwtToken , createAccount)
router.get("/getAllAccountDetails" , verifyJwtToken , getAllAccountDetails)
export default router