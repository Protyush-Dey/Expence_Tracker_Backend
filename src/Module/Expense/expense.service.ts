import { ApiError } from "../../utils/ApiError";
import { prisma } from "../../config/prisma";

export enum Category {
  FOOD = "FOOD",
  TRAVEL = "TRAVEL",
  SHOPPING = "SHOPPING",
  BILLS = "BILLS",
}

export class ExpenseService {
  // Create Expense
  async createExpense(
    userId: string,
    data: {
      amount: number;
      description: string;
      isGiven: boolean;
      account: string;
      date: Date | string;
      category: string;
    }
  ) {
    const { amount, description, isGiven, account, date, category } = data;

    const findAccount = await prisma.account.findUnique({
      where: { id: account },
    });
    if (!findAccount) throw new ApiError(400, "Account not found");
    if (findAccount.userId !== userId) throw new ApiError(400, "Access denied");

    const normalizedCategory = category.toUpperCase() as Category;
    if (!Object.values(Category).includes(normalizedCategory)) {
      throw new ApiError(400, "Invalid category");
    }

    const createdExpense = await prisma.expense.create({
      data: {
        amount: Number(amount),
        description,
        isGiven: Boolean(isGiven),
        accountId: account,
        userId,
        date: date ? new Date(date) : new Date(),
        category: normalizedCategory,
      },
    });

    if (!createdExpense) throw new ApiError(400, "Expense does not create");

    return {
      ...createdExpense,
      _id: createdExpense.id,
      account: createdExpense.accountId,
      user: createdExpense.userId,
      category: createdExpense.category.toLowerCase(),
    };
  }

  // Delete Expense
  async deleteExpense(userId: string, expenseId: string) {
    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
    });
    if (!expense) throw new ApiError(400, "Expense not found");

    const account = await prisma.account.findUnique({
      where: { id: expense.accountId },
    });
    if (!account) throw new ApiError(400, "Account not found");
    if (account.userId !== userId) throw new ApiError(400, "Access denied");

    await prisma.expense.delete({
      where: { id: expenseId },
    });
  }

  // Get Last 30 Spend
  async getThirtySpend(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new ApiError(404, "user not found");

    const data = await prisma.expense.findMany({
      where: {
        userId,
        isGiven: true,
      },
      orderBy: {
        date: "desc",
      },
      take: 30,
    });

    return data.map((e) => ({
      ...e,
      _id: e.id,
      account: e.accountId,
      user: e.userId,
      category: e.category.toLowerCase(),
    }));
  }
}
