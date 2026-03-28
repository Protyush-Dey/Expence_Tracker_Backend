import { Request, Response } from "express";
import { asyncHandler } from "../../utils/AsyncHandler";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { BaseController } from "../../Base/Base.controller";
import { AccountService } from "./account.service";

const accountService = new AccountService();

class AccountController extends BaseController {


  // create account
  createAccount = asyncHandler(async (req: Request, res: Response) => {
    const { account } = req.body as { account: string };
    if (!account) throw new ApiError(400, "Give a account number");

    const created = await accountService.createAccount(this.getUserId(req), account);
    return this.created(res, "Account Created", created);
  });


  //get all account and there balance
  getAllAccountDetails = asyncHandler(async (req: Request, res: Response) => {
    const accounts = await accountService.getAllAccountDetails(this.getUserId(req));
    return res.status(200).json(new ApiResponse(200, "All account data", accounts));
  });


  // get expense with current month
  getMonthExpenseOfAccount = asyncHandler(async (req: Request, res: Response) => {
    const { accountNo } = req.params;
    if (!accountNo) throw new ApiError(400, "Send the account");

    const data = await accountService.getExpenseOfAccountByDates(this.getUserId(req), accountNo.toString());
    return res.status(200).json(new ApiResponse(200, "Monthly expenses fetched", data));
  });



  
  // get expense with dates
  getExpenseOfAccountByDates = asyncHandler(async (req: Request, res: Response) => {
    const { accountNo } = req.params;
    const { startOfMonth, endOfMonth } = req.query as {
      startOfMonth?: string;
      endOfMonth?: string;
    };
    if (!accountNo) throw new ApiError(400, "Send the account");
    if (!startOfMonth || !endOfMonth) throw new ApiError(400, "Send the dates");

    const data = await accountService.getExpenseOfAccountByDates(
      this.getUserId(req), accountNo.toString(), startOfMonth, endOfMonth
    );
    return res.status(200).json(new ApiResponse(200, "Monthly expenses fetched", data));
  });


  //delete account
  deleteAccount = asyncHandler(async (req: Request, res: Response) => {
    const { accountNo } = req.params;
    if (!accountNo) throw new ApiError(400, "Send the account");

    await accountService.deleteAccount(this.getUserId(req), accountNo.toString());
    return res.status(200).json(new ApiResponse(200, "Account deleted successfully"));
  });
}

export const accountController = new AccountController();