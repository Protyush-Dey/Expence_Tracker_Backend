// import{addAllExpense} from "../Controller/user.controller.js"
import { Router } from "express";
import {
  forgotPassword,
  loginUser,
  logoutUser,
  registerUser,
  resetRefreshToken,
  updatePassword,
  verifyPasswordChangeOtp,
  findUser,
  getMonthExpenseOfUser,
  getExpenseOfUserByDates,
  changePrimaryAccount
} from "../Controller/user.controller.js";
import {
  verifyJwtToken,
  verifyOtpJwtToken,
} from "../middleware/Auth.middleware.js";
const router = Router();
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", verifyJwtToken, logoutUser);
router.post("/ResetRefreshToken", resetRefreshToken);
router.post("/forgotPassword", forgotPassword);
router.post("/verifyPasswordChangeOtp", verifyPasswordChangeOtp);
router.post("/updatePassword", verifyOtpJwtToken, updatePassword);
router.get("/findUser/:loginInfo", findUser);
router.get("/getMonthExpenseOfUser", verifyJwtToken, getMonthExpenseOfUser);
router.get("/getExpenseOfUserByDates", verifyJwtToken, getExpenseOfUserByDates);
router.patch("/changePrimaryAccount/:accountId", verifyJwtToken, changePrimaryAccount);
export default router;
