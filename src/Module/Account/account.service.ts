import mongoose from "mongoose";
import { ApiError } from "../../utils/ApiError";
import { BaseService } from "../../Base/Base.service";
import { Account, AccountModel } from "./account.model";
import { ExpenseModel } from "../Expense/expences.model";
import { UserModel } from "../User/user.model";

export class AccountService extends BaseService<Account> {
  constructor() {
    super(AccountModel);
  }


  // create account
  async createAccount(userId: string, accountName: string) {
    const madeAccount = await this.create({ account: accountName, user: new mongoose.Types.ObjectId(userId) });

    const user = await UserModel.findById(userId);
    if (!user) throw new ApiError(404, "User not found");
    if(!user.primaryAccount)user.primaryAccount = madeAccount._id;
    await user.save();
    return madeAccount;
  }


//   //get account and balance
  async getAllAccountDetails(userId: string) {
    const accounts = await AccountModel.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: "expenses",
          localField: "_id",
          foreignField: "account",
          as: "expenses",
        },
      },
      {
        $addFields: {
          balance: {
            $sum: {
              $map: {
                input: "$expenses",
                as: "exp",
                in: {
                  $cond: [
                    "$$exp.isGiven",
                    { $multiply: ["$$exp.amount", -1] },
                    "$$exp.amount",
                  ],
                },
              },
            },
          },
        },
      },
      { $project: { account: 1, balance: 1 } },
    ]);

    if (!accounts.length) throw new ApiError(404, "No accounts found");
    return accounts;
  }



//   async getMonthExpenseOfAccount(userId: string, accountNo: string) {
//     await this._verifyOwnership(userId, accountNo);

//     const startOfMonth = new Date();
//     startOfMonth.setDate(1);
//     startOfMonth.setHours(0, 0, 0, 0);
//     const endOfMonth = new Date();
//     endOfMonth.setMonth(endOfMonth.getMonth() + 1);
//     endOfMonth.setDate(0);
//     endOfMonth.setHours(23, 59, 59, 999);

//     return this._aggregateExpenses(accountNo, startOfMonth, endOfMonth);
//   }


// get account expense by date
  async getExpenseOfAccountByDates(
    userId: string,
    accountNo: string,
    startDate?: string,
    endDate?: string
  ) {
    await this._verifyOwnership(userId, accountNo);

    let start: Date;
  let end: Date;

  if (!startDate || !endDate) {
    start = new Date();
    start.setDate(1);
    start.setHours(0, 0, 0, 0);

    end = new Date();
    end.setMonth(end.getMonth() + 1);
    end.setDate(0);
    end.setHours(23, 59, 59, 999);
  } else {
    start = new Date(startDate);
    end = new Date(endDate);
  }
    if (isNaN(start.getTime()) || isNaN(end.getTime()))
      throw new ApiError(400, "Invalid date format");

    return this._aggregateExpenses(accountNo, start, end);
  }


    // delete account
  async deleteAccount(userId: string, accountNo: string) {
    await this._verifyOwnership(userId, accountNo);
    const accountObjectId = new mongoose.Types.ObjectId(accountNo);
    const user = await UserModel.findById(userId);
    if (!user) throw new ApiError(404, "User not found");
    if (
  (user.cashAccount as mongoose.Types.ObjectId)?.equals(accountObjectId) ||
  (user.primaryAccount as mongoose.Types.ObjectId)?.equals(accountObjectId)
)
      throw new ApiError(400, "Cannot delete primary or cash account");

    await ExpenseModel.deleteMany({ account: accountNo });
    await this.deleteById(accountNo);
  }



  // verify the user
  private async _verifyOwnership(userId: string, accountNo: string) {
    const account = await AccountModel.findById(accountNo);
    if (!account) throw new ApiError(404, "Account not found");
    this.assertOwnership(String(account.user), userId);
    return account;
  }

  private async _aggregateExpenses(accountNo: string, startDate: Date, endDate: Date) {
    const expenses = await ExpenseModel.aggregate([
      {
        $match: {
          account: new mongoose.Types.ObjectId(accountNo),
          date: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $group: {
          _id: null,
          totalSpend: { $sum: { $cond: [{ $eq: ["$isGiven", true] }, "$amount", 0] } },
          totalGet: { $sum: { $cond: [{ $eq: ["$isGiven", false] }, "$amount", 0] } },
          expenses: { $push: "$$ROOT" },
        },
      },
    ]);

    return {
      accountNo,
      totalSpend: expenses[0]?.totalSpend ?? 0,
      totalGet: expenses[0]?.totalGet ?? 0,
      expenses: expenses[0]?.expenses ?? [],
    };
  }
}