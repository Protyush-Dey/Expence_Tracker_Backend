import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Account } from "../Models/account.model.js";
import { Expense } from "../Models/expences.model.js";
import mongoose from "mongoose";
// create a account
const createAccount = asyncHandler(async (req, res) => {
  const { account } = req.body;
  if (!account) throw new ApiError(400, "give a account number");
  const madeAccount = await Account.create({
    account,
    user: req.user._id,
  });
  const createdAccount = await Account.findById(madeAccount._id);
  if (!createdAccount)
    throw new ApiError(400, "something went wrong wile account create");
  return res.status(200).json(new ApiResponse(200, "account Created"));
});

// get all account balance
const getAllAccountDetails = asyncHandler(async (req, res) => {
  try {
    const accounts = await Account.aggregate([
      {
        $match: {
          user: req.user._id,
        },
      },
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
      {
        $project: {
          account: 1,
          balance: 1,
        },
      },
    ]);
    if (accounts.length === 0) throw new ApiError(400, "no account created");
    return res
      .status(200)
      .json(new ApiResponse(200, accounts, "all account data"));
  } catch (error) {
    throw new ApiError(401, error?.message || "something went wrong");
  }
});

// get expences of a account

const getMonthExpenseOfAccount = asyncHandler(async (req, res) => {
  const { accountNo } = req.params;
  if (!accountNo) throw new ApiError(400, "send the account");
  const account = await Account.findById(accountNo);
  if (!account) throw new ApiError(400, "account not found");
  if (account.user.toString() !== req.user.id)
    throw new ApiError(400, "Access denied");
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const endOfMonth = new Date();
  endOfMonth.setMonth(endOfMonth.getMonth() + 1);
  endOfMonth.setDate(0);
  endOfMonth.setHours(23, 59, 59, 999);
  const expenses = await Expense.aggregate([
    {
      $match: {
        account: new mongoose.Types.ObjectId(accountNo),
        date: { $gte: startOfMonth, $lt: endOfMonth },
      },
    },
    {
      $group: {
        _id: null,
        totalSpend: {
          $sum: {
            $cond: [{ $eq: ["$isGiven", true] }, "$amount", 0],
          },
        },
        totalGet: {
          $sum: {
            $cond: [{ $eq: ["$isGiven", false] }, "$amount", 0],
          },
        },
        expenses: { $push: "$$ROOT" },
      },
    },
  ]);
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        accountNo,
        totalSpend: expenses[0]?.totalSpend || 0,
        totalGet: expenses[0]?.totalGet || 0,
        expenses: expenses[0]?.expenses || [],
      },
      "Monthly expenses fetched",
    ),
  );
});

//get expense of a account with date
const getExpenseOfAccountByDates = asyncHandler(async (req, res) => {
  const { accountNo } = req.params;
  const { startOfMonth, endOfMonth } = req.query;
  if (!accountNo) throw new ApiError(400, "send the account");
  if (!startOfMonth || !endOfMonth) throw new ApiError(400, "send the dates");
  const startDate = new Date(startOfMonth);
  const endDate = new Date(endOfMonth);
  const account = await Account.findById(accountNo);
  if (!account) throw new ApiError(400, "account not found");
  if (account.user.toString() !== req.user.id)
    throw new ApiError(400, "Access denied");
  const expenses = await Expense.aggregate([
    {
      $match: {
        account: new mongoose.Types.ObjectId(accountNo),
        date: { $gte: startDate, $lt: endDate },
      },
    },
    {
      $group: {
        _id: null,
        totalSpend: {
          $sum: {
            $cond: [{ $eq: ["$isGiven", true] }, "$amount", 0],
          },
        },
        totalGet: {
          $sum: {
            $cond: [{ $eq: ["$isGiven", false] }, "$amount", 0],
          },
        },
        expenses: { $push: "$$ROOT" },
      },
    },
  ]);
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        accountNo,
        totalSpend: expenses[0]?.totalSpend || 0,
        totalGet: expenses[0]?.totalGet || 0,
        expenses: expenses[0]?.expenses || [],
      },
      "Monthly expenses fetched",
    ),
  );
});

//delete account
const deleteAccount = asyncHandler(async (req, res) => {
  const { accountNo } = req.params;
  if (!accountNo) throw new ApiError(400, "send the account");
  const account = await Account.findById(accountNo);
  if (!account) throw new ApiError(400, "account not found");
  if (account.user.toString() !== req.user.id)
    throw new ApiError(400, "Access denied");
  const deleteExpenses = await Expense.deleteMany({ account: accountNo });
  if (!deleteExpenses) throw new ApiError(400, "expenses are not deleted");
  const deleteaccount = await Account.findByIdAndDelete(accountNo);
  if (!deleteaccount) throw new ApiError(400, "expenses are not deleted");
  return res
    .status(200)
    .json(new ApiResponse(200, "account deleted successfully"));
});
export {
  createAccount,
  getAllAccountDetails,
  getMonthExpenseOfAccount,
  getExpenseOfAccountByDates,
  deleteAccount,
};
