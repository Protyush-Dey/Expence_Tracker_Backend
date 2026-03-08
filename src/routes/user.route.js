// import{addAllExpense} from "../Controller/user.controller.js"
import { Router } from "express";
import { registerUser } from "../Controller/user.controller.js";
const router = Router();
 router.post("/register" , registerUser)

export default router