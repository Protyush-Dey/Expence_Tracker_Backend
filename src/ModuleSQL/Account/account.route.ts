import { Router } from "express";
import { verifyJwtToken } from "../../middleware/Auth.middleware";
import {accountController} from "./account.controller"

const accountRouter = Router();

// accountRouter.post("/createAccount" , verifyJwtToken , accountController.createAccount)
accountRouter.get("/getAllAccountDetails" , verifyJwtToken , accountController.getAllAccountDetails)


// not tested yet
// accountRouter.get("/getMonthExpenseOfAccount/:accountNo" , verifyJwtToken , accountController.getMonthExpenseOfAccount)
// accountRouter.get("/getExpenseOfAccountByDates/:accountNo" , verifyJwtToken , accountController.getExpenseOfAccountByDates)
// accountRouter.delete("/deleteAccount/:accountNo" , verifyJwtToken , accountController.deleteAccount)

export default accountRouter;
