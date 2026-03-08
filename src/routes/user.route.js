// import{addAllExpense} from "../Controller/user.controller.js"
import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../Controller/user.controller.js";
import { verifyJwtToken } from "../middleware/Auth.middleware.js";
const router = Router();
 router.post("/register" , registerUser)
 router.post("/login" , loginUser)
 router.post("/logout", verifyJwtToken, logoutUser)
export default router