import { Router } from "express";
import { userController } from "./user.controller";
console.log("==> user.controller loaded");
import { verifyJwtToken, verifyOtpJwtToken } from "../../middleware/Auth.middleware";


const userRouter = Router();

userRouter.post("/register" , userController.registerUser); //use
userRouter.post("/logIn" , userController.loginUser);   //use
userRouter.post("/logOut" , verifyJwtToken , userController.logoutUser);
userRouter.get("/me" , verifyJwtToken , userController.me); //use
userRouter.post("/resetRefreshToken" , userController.resetRefreshToken);
userRouter.post("/forgotPassword" , userController.forgotPassword);//use
userRouter.post("/verifyPasswordChangeOtp" , userController.verifyPasswordChangeOtp);//use
userRouter.post("/updatePassword" ,verifyOtpJwtToken, userController.updatePassword);//use
userRouter.get("/findUser/:loginInfo", userController.findUser);

// have not tested yet
userRouter.get("/getMonthExpenseOfUser", verifyJwtToken, userController.getMonthExpenseOfUser);
userRouter.get("/getExpenseOfUserByDates", verifyJwtToken, userController.getExpenseOfUserByDates);
userRouter.patch("/changePrimaryAccount/:accountId", verifyJwtToken, userController.changePrimaryAccount);

export default userRouter;