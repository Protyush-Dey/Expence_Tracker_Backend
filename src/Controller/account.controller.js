import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Account } from "../Models/account.model.js";

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
export { createAccount, getAllAccountDetails };
