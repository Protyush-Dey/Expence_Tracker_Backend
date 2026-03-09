import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Expense } from "../Models/expences.model.js";
import { Account } from "../Models/account.model.js";
// create a expense
const createExpense = asyncHandler(async (req, res) => {
  const { amount, description, isGiven, account, date } = req.body;
  if (!amount || !description || isGiven === undefined || !account || !date) {
    throw new ApiError(400, "All fields are required");
  }
  const findAccount = await Account.findById(account);
  if (!findAccount) throw new ApiError(400, "account not found");
  if (!findAccount.user.equals(req.user._id)) {
    throw new ApiError(400, "access denied");
  }
  const createingExpense = await Expense.create({
    amount,
    description,
    isGiven,
    account,
    date: new Date(date),
  });
  const createdExpense = await Expense.findById(createingExpense._id);
  if (!createdExpense) throw new ApiError(400, "Expense Does not create");
  return res
    .status(200)
    .json(new ApiResponse(200, "expense created successfully"));
});

export { createExpense };
