import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Split } from "../Models/split.model.js";
import { User } from "../Models/user.model.js";
import { Expense } from "../Models/expences.model.js";

//make a single split
const createSingleSplit = asyncHandler(async (req, res) => {
  const user = req.user._id;
  const { splitTo, amount, description } = req.body;
  if (description.trim() == "" || !amount || !splitTo)
    throw new ApiError(400, "give all feilds");
  const split = Split.create({
    splitFrom: user,
    splitTo,
    amount,
    description,
  });
  const createdSplit = Split.findById(split._id);
  if (!createdSplit) throw new ApiError(400, "split does not created");
  return res.status(200).json(new ApiResponse(200, "split made successfully"));
});
//make all split to give
const createSplit = asyncHandler(async (req, res) => {
  const user = req.user._id;
  const { details, description } = req.body;
  if (description.trim() == "" || !details.length)
    throw new ApiError(400, "give all feilds");
  const splits = details.map((d) => ({
    splitFrom: user,
    splitTo: d.splitTo,
    amount: d.amount,
    description: description,
  }));
  await Split.insertMany(splits);
  return res.status(200).json(new ApiResponse(200, "split made successfully"));
});
//get alldue split to give
const dueGiveSplit = asyncHandler(async (req, res) => {
  try {
    const user = req.user._id;
    const { friendId } = req.params;
    if (!friendId) throw new ApiError(400, "give the friend id");
    const splits = await Split.aggregate([
      {
        $match: {
          splitFrom: new mongoose.Types.ObjectId(friendId),
          splitTo: new mongoose.Types.ObjectId(user),
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          splits: { $push: "$$ROOT" },
        },
      },
    ]);
    return res.status(200).json(200, splits, "get alldue split to give");
  } catch (error) {
    throw new ApiError(400, error.message || "something went wrong");
  }
});
//get all due split to get
const dueGetSplit = asyncHandler(async (req, res) => {
  try {
    const user = req.user._id;
    const { friendId } = req.params;
    if (!friendId) throw new ApiError(400, "give the friend id");
    const splits = await Split.aggregate([
      {
        $match: {
          splitTo: new mongoose.Types.ObjectId(friendId),
          splitFrom: new mongoose.Types.ObjectId(user),
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          splits: { $push: "$$ROOT" },
        },
      },
    ]);
    return res.status(200).json(200, splits, "get alldue split to give");
  } catch (error) {
    throw new ApiError(400, error.message || "something went wrong");
  }
});

// delete split
const deleteSplit = asyncHandler(async (req, res) => {
  try {
    const user = req.user._id;
    const splitId = req.params;
    if (!splitId) throw new ApiError(400, "give the SplitId");
    const split = await Split.findById(splitId);
    if (!split.splitFrom.equals(user)) throw new ApiError(400, "access denied");
    await Split.findByIdAndDelete(splitId);
    return res.status(200).json(200, "Split deleted");
  } catch (error) {
    throw new ApiError(400, error.message || "something went wrong");
  }
});
// paying all due
const payAllDueDone = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { friendId } = req.params;
  if (!friendId) throw new ApiError(400, "give the friendId");
  const splits = await Split.find({ splitFrom: friendId, splitTo: userId });
  if (!splits.length) throw new ApiError(400, "split not found");
  const totalAmount = splits.reduce((sum, split) => sum + split.amount, 0);

  const userFrom = await User.findById(friendId);
  const userTo = await User.findById(userId);

  let accountFrom = userFrom.primaryAccount;
  if (!accountFrom) accountFrom = userFrom.cashAccount;
  const createingExpenseFrom = await Expense.create({
    amount: totalAmount,
    description: `splits from ( ${userTo.fullName})`,
    isGiven: false,
    account: accountFrom,
    date: new Date(),
  });

  let accountTo = userTo.primaryAccount;
  if (!accountTo) accountTo = userTo.cashAccount;
  const createingExpenseTo = await Expense.create({
    amount: totalAmount,
    description: `splits to ( ${userFrom.fullName})`,
    isGiven: true,
    account: accouneTo,
    date: new Date(),
  });

  const splitIds = splits.map((s) => s._id);

  await Split.deleteMany({ _id: { $in: splitIds } });
  return res.status(200).json(new ApiResponse(200, "mark one due done"));
});
// pay one due
const payDueDone = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { splitId } = req.body;
  if (!splitId) throw new ApiError(400, "give the splitid");
  const split = await Split.findById(splitId);
  if (!split) throw new ApiError(400, "split not found");
  if (!split.splitTo.equals(userId)) throw new ApiError(400, "access denied");

  const userFrom = await User.findById(split.splitFrom);
  const userTo = await User.findById(userId);
  let accountFrom = userFrom.primaryAccount;
  if (!accountFrom) accountFrom = userFrom.cashAccount;
  const createingExpenseFrom = await Expense.create({
    amount: split.amount,
    description: `${split.description} from ( ${userTo.fullName})`,
    isGiven: false,
    account: accountFrom,
    date: new Date(),
  });

  let accouneTo = userTo.primaryAccount;
  if (!accouneTo) accouneTo = userTo.cashAccount;
  const createingExpenseTo = await Expense.create({
    amount: split.amount,
    description: `${split.description} to ( ${userFrom.fullName})`,
    isGiven: true,
    account: accouneTo,
    date: new Date(),
  });

  await Split.findByIdAndDelete(splitId);
  return res.status(200).json(new ApiResponse(200, "mark one due done"));
});
// mark all due done
const markAllDueDone = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { friendId } = req.params;
if (!friendId) throw new ApiError(400, "give the friendId");
  const splits = await Split.find({ splitTo: friendId, splitFrom: userId });
  if (!splits.length) throw new ApiError(400, "split not found");
  const totalAmount = splits.reduce((sum, split) => sum + split.amount, 0);

  const userFrom = await User.findById(friendId);
  const userTo = await User.findById(userId);
if (!userFrom || !userTo)
  throw new ApiError(404, "user not found");
  const createingExpenseFrom = await Expense.create({
    amount: totalAmount,
    description: `splits from ( ${userTo.fullName})`,
    isGiven: false,
    account: userFrom.cashAccount,
    date: new Date(),
  });

  const createingExpenseTo = await Expense.create({
    amount: totalAmount,
    description: `splits to ( ${userFrom.fullName})`,
    isGiven: true,
    account: userTo.cashAccount,
    date: new Date(),
  });

  const splitIds = splits.map((s) => s._id);

  await Split.deleteMany({ _id: { $in: splitIds } });
  return res.status(200).json(new ApiResponse(200, "mark one due done"));
});
// mark one due done
const markDueDone = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { splitId } = req.body;
  if (!splitId) throw new ApiError(400, "give the splitid");
  const split = await Split.findById(splitId);
  if (!split) throw new ApiError(400, "split not found");
  if (!split.splitFrom.equals(userId)) throw new ApiError(400, "access denied");
  const user = await User.findById(userId);
  const userTo = await User.findById(split.splitTo);
  if (!user || !userTo) throw new ApiError(404, "user not found");
  const createingExpense = await Expense.create({
    amount: split.amount,
    description: `${split.description} from ( ${userTo.fullName})`,
    isGiven: false,
    account: user.cashAccount,
    date: new Date(),
  });

  const createingExpenseTo = await Expense.create({
    amount: split.amount,
    description: `${split.description} to ( ${user.fullName})`,
    isGiven: true,
    account: userTo.cashAccount,
    date: new Date(),
  });
  await Split.findByIdAndDelete(splitId);
  return res.status(200).json(new ApiResponse(200, "mark one due done"));
});
export {
  createSingleSplit,
  createSplit,
  dueGiveSplit,
  dueGetSplit,
  deleteSplit,
  payAllDueDone,
  payDueDone,
  markAllDueDone,
  markDueDone
};
