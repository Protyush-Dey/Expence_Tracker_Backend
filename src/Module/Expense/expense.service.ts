import mongoose from "mongoose";
import { ApiError } from "../../utils/ApiError";
import { BaseService } from "../../Base/Base.service";
import { Category, Expense, ExpenseModel } from "./expences.model";
import { AccountModel } from "../Account/account.model";
import { UserModel } from "../User/user.model";

export class ExpenseService extends BaseService<Expense> {
  constructor() {
    super(ExpenseModel);
  }

  // Create Expense

  async createExpense(
    userId: string,
    data: {
      amount: number;
      description: string;
      isGiven: boolean;
      account: string;
      date: Date;
      category: Category;
    },
  ) {
    const { amount, description, isGiven, account, date, category } = data;

    const findAccount = await AccountModel.findById(account);
    if (!findAccount) throw new ApiError(400, "Account not found");
    if (!(findAccount.user as mongoose.Types.ObjectId)?.equals(userId))
      throw new ApiError(400, "Access denied");

    const creatingExpense = await ExpenseModel.create({
      amount,
      description,
      isGiven,
      account,
      date: new Date(),
      category,
      user:userId,
    });

    const createdExpense = await ExpenseModel.findById(creatingExpense._id);
    if (!createdExpense) throw new ApiError(400, "Expense does not create");

    return createdExpense;
  }

  // Delete Expense

  async deleteExpense(userId: string, expenseId: string) {
    const expense = await ExpenseModel.findById(expenseId);
    if (!expense) throw new ApiError(400, "Expense not found");

    const account = await AccountModel.findById(expense.account);
    if (!account) throw new ApiError(400, "Account not found");
    if (!(account.user as mongoose.Types.ObjectId)?.equals(userId))
      throw new ApiError(400, "Access denied");

    await ExpenseModel.findByIdAndDelete(expenseId);
  }

  async getThirtySpend(userId: string) {
    const user = await UserModel.findById(userId);
    if (!user) throw new ApiError(404, "user not found");
    const data = await ExpenseModel.find({
      user: userId,
      isGiven: true,
    })
      .sort({ date: -1 })
      .limit(30);
      return data;
  }
}
