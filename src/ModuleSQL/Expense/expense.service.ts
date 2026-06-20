import mongoose from "mongoose";
import { ApiError } from "../../utils/ApiError";
import { db } from "../../config/mysqlconfig";

export class ExpenseService  {

  // Create Expense

  async createExpense(
    userId: string,
    data: {
      amount: number;
      description: string;
      isGiven: boolean;
      account: string;
      date: Date;
      category: string;
    },
  ) {
    const { amount, description, isGiven, account, date, category } = data;

    const [accounts]: any = await db.execute(
      `
      SELECT id
      FROM accounts
      WHERE id = ? AND user_id = ?
      `,
      [account, userId]
    );

    if (accounts.length === 0) {
      throw new ApiError(404, "Account not found");
    }

    // Create expense
    const [createdExpense]: any = await db.execute(
      `
      INSERT INTO expenses (
        account_id,
        user_id,
        amount,
        description,
        category,
        is_given,
        expense_date
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        account,
        userId,
        amount,
        description,
        category,
        isGiven,
        date,
      ]
    );

    return createdExpense;
  }

  // Delete Expense

  // async deleteExpense(userId: string, expenseId: string) {
  //   const expense = await ExpenseModel.findById(expenseId);
  //   if (!expense) throw new ApiError(400, "Expense not found");

  //   const account = await AccountModel.findById(expense.account);
  //   if (!account) throw new ApiError(400, "Account not found");
  //   if (!(account.user as mongoose.Types.ObjectId)?.equals(userId))
  //     throw new ApiError(400, "Access denied");

  //   await ExpenseModel.findByIdAndDelete(expenseId);
  // }

  // async getThirtySpend(userId: string) {
  //   const user = await UserModel.findById(userId);
  //   if (!user) throw new ApiError(404, "user not found");
  //   const data = await ExpenseModel.find({
  //     user: userId,
  //     isGiven: true,
  //   })
  //     .sort({ date: -1 })
  //     .limit(30);
  //     return data;
  // }
}
