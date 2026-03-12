import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { FriendRequest } from "../Models/friendRequest.model.js";
import { User } from "../Models/user.model.js";
// make friend request
const makeRequest = asyncHandler(async (req, res) => {
  const { requestTo } = req.params;
  if (!requestTo) throw new ApiError(400, "give a account id");
  const friend = await User.findById(requestTo);
  if (!friend) throw new ApiError(400, "friend not found");
  const user = req.user.id;
  if (requestTo == user) throw new ApiError(400, "it is you");
  const frienRequest = await FriendRequest.create({
    requestTo,
    requestFrom: user,
  });
  const createdRequest = await FriendRequest.findById(frienRequest._id);
  if (!createdRequest) throw new ApiError(400, "request does not geanrated");
  return res.status(200).json(new ApiResponse(200, "request created"));
});
//reject friend request
const rejectRequest = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { requestId } = req.params;
  if (!requestId) throw new ApiError(400, "gicve the information");
  const request = await FriendRequest.findById(requestId);
  if (!request) throw new ApiError(400, "request not find");
  if (request.requestTo.toString() !== userId)
    throw new ApiError(400, "access denied");
  await FriendRequest.findByIdAndDelete(requestId);
  return res.status(200).json(new ApiResponse(200, "request rejected"));
});
//delete friend request
const delteRequest = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { requestId } = req.params;
  if (!requestId) throw new ApiError(400, "give the information");
  const request = await FriendRequest.findById(requestId);
  if (!request) throw new ApiError(400, "request not find");
  if (request.requestFrom.toString() !== userId)
    throw new ApiError(400, "access denied");
  await FriendRequest.findByIdAndDelete(requestId);
  return res.status(200).json(new ApiResponse(200, "request rejected"));
});
//get all request recieved
const getAllRequestRecieved = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  try {
    const requests = await FriendRequest.aggregate([
      {
        $match: {
          requestTo: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "requestFrom",
          foreignField: "_id",
          as: "sender",
        },
      },
      {
        $unwind: "$sender",
      },
      {
        $project: {
          _id: 1,
          createdAt: 1,
          senderName: "$sender.userName",
          senderEmail: "$sender.email",
          senderFullName: "$sender.fullName",
        },
      },
    ]);
    return res
      .status(200)
      .json(new ApiResponse(200, requests || [], "get all request recievied"));
  } catch (error) {
    throw new ApiError(400, error.message || "something went wrong");
  }
});
const getAllRequestDone = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  try {
    const requests = await FriendRequest.aggregate([
      {
        $match: {
          requestFrom: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "requestTo",
          foreignField: "_id",
          as: "Reciever",
        },
      },
      {
        $unwind: "$Reciever",
      },
      {
        $project: {
          _id: 1,
          createdAt: 1,
          senderName: "$Reciever.userName",
          senderEmail: "$Reciever.email",
          senderFullName: "$Reciever.fullName",
        },
      },
    ]);
    return res
      .status(200)
      .json(new ApiResponse(200, requests || [], "get all request done"));
  } catch (error) {
    throw new ApiError(400, error.message || "something went wrong");
  }
});
export {
  makeRequest,
  rejectRequest,
  delteRequest,
  getAllRequestRecieved,
  getAllRequestDone,
};
