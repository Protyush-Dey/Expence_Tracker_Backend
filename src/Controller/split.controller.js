import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Split } from "../Models/split.model.js";

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
    const {friendId} = req.params;
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
          splits: { $push: "$$ROOT" }
        }
      }
    ]);
    return res.status(200).json(200 , splits , "get alldue split to give")
  } catch (error) {
    throw new ApiError(400, error.message||"something went wrong");
  }
});
//get all due split to get
const dueGetSplit = asyncHandler(async (req, res) => {try {
    const user = req.user._id;
    const {friendId} = req.params;
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
          splits: { $push: "$$ROOT" }
        }
      }
    ]);
    return res.status(200).json(200 , splits , "get alldue split to give")
  } catch (error) {
    throw new ApiError(400, error.message||"something went wrong");
  }
});

export { createSingleSplit, createSplit, dueGiveSplit, dueGetSplit };
