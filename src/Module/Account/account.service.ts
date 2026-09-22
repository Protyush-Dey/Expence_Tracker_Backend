import { ApiError } from "../../utils/ApiError";
import { prisma } from "../../config/prisma";

export class AccountService {
  // create account
  async createAccount(userId: string, accountName: string) {
    const madeAccount = await prisma.account.create({
      data: {
        account: accountName,
        userId,
      },
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new ApiError(404, "User not found");

    if (!user.primaryAccountId) {
      await prisma.user.update({
        where: { id: userId },
        data: { primaryAccountId: madeAccount.id },
      });
    }

    return {
      ...madeAccount,
      _id: madeAccount.id,
    };
  }

  // get account and balance
  async getAllAccountDetails(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { cashAccountId: true, primaryAccountId: true },
    });

    const accounts = await prisma.account.findMany({
      where: { userId },
      include: {
        expenses: {
          select: {
            amount: true,
            isGiven: true,
          },
        },
      },
    });

    if (!accounts.length) throw new ApiError(404, "No accounts found");

    return accounts.map((acc) => {
      const balance = acc.expenses.reduce((sum, exp) => {
        return exp.isGiven ? sum - exp.amount : sum + exp.amount;
      }, 0);

      let type = "normal";
      if (acc.id === user?.cashAccountId) {
        type = "cash";
      } else if (acc.id === user?.primaryAccountId) {
        type = "primary";
      }

      return {
        id: acc.id,
        _id: acc.id,
        account_id: acc.id,
        account: acc.account,
        account_name: acc.account,
        user_id: acc.userId,
        balance,
        type,
      };
    });
  }

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
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new ApiError(404, "User not found");

    if (
      user.cashAccountId === accountNo ||
      user.primaryAccountId === accountNo
    ) {
      throw new ApiError(400, "Cannot delete primary or cash account");
    }

    await prisma.expense.deleteMany({
      where: { accountId: accountNo },
    });

    await prisma.account.delete({
      where: { id: accountNo },
    });
  }

  // verify the user
  private async _verifyOwnership(userId: string, accountNo: string) {
    const account = await prisma.account.findUnique({
      where: { id: accountNo },
    });
    if (!account) throw new ApiError(404, "Account not found");
    if (account.userId !== userId) throw new ApiError(403, "Access denied");
    return account;
  }

  // aggregate func
  private async _aggregateExpenses(
    accountNo: string,
    startDate: Date,
    endDate: Date
  ) {
    const expenses = await prisma.expense.findMany({
      where: {
        accountId: accountNo,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    const totalSpend = expenses
      .filter((e) => e.isGiven)
      .reduce((sum, e) => sum + e.amount, 0);

    const totalGet = expenses
      .filter((e) => !e.isGiven)
      .reduce((sum, e) => sum + e.amount, 0);

    return {
      accountNo,
      totalSpend,
      totalGet,
      expenses: expenses.map((e) => ({
        _id: e.id,
        id: e.id,
        amount: e.amount,
        description: e.description,
        isGiven: e.isGiven,
        category: e.category.toLowerCase(),
        date: e.date,
        account: e.accountId,
        user: e.userId,
      })),
    };
  }
}