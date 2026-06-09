import { Request, Response } from "express";
import { asyncHandler } from "../../utils/AsyncHandler";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { BaseController } from "../../Base/Base.controller";
import { ExpenseService } from "./expense.service";
import { Category } from "./expences.model";

const expenseService = new ExpenseService();

class ExpenseController extends BaseController {


  // Create Expense
  createExpense = asyncHandler(async (req: Request, res: Response) => {
    const { amount, description, isGiven, account, date ,category} = req.body as {
      amount: number;
      description: string;
      isGiven: boolean;
      account: string;
      date: Date;
      category:Category
    };

    if (amount == null || !description || isGiven === undefined || !account || !date || !category)
      throw new ApiError(400, "All fields are required");

    const createdExpense = await expenseService.createExpense(
      this.getUserId(req),
      { amount, description, isGiven, account, date, category }
    );

    return res
      .status(200)
      .json(new ApiResponse(200, "Expense created successfully", createdExpense));
  });

  

  // Delete Expense
  deleteExpense = asyncHandler(async (req: Request, res: Response) => {
    const { expenseId } = req.body as { expenseId: string };
    if (!expenseId) throw new ApiError(400, "Give the expenseId");

    await expenseService.deleteExpense(this.getUserId(req), expenseId);

    return res
      .status(200)
      .json(new ApiResponse(200, "Expense deleted successfully"));
  });



//get last 30 spend entry
  getThirtySpend = asyncHandler(async (req: Request, res: Response) => {

    const data = await expenseService.getThirtySpend(this.getUserId(req));

    return res
      .status(200)
      .json(new ApiResponse(200, "Get Last 30 spend successfully" , data));
  });


}

export const expenseController = new ExpenseController();