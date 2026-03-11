import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { FrienRequest } from "../Models/frienRequest.model.js";
import { User } from "../Models/user.model.js";

const makeRequest = asyncHandler(async (req, res) => {
  const { requestTo } = req.params;
  if (!requestTo) throw new ApiError(400, "give a account id");
  const friend = await User.findById(requestTo);
  if (!friend) throw new ApiError(400, "friend not found");
  const user = req.user.id;
  if(requestTo == user) throw new ApiError(400, "it is you");
  const frienRequest = await FrienRequest.create({
    requestTo,
    requestFrom: user,
  });
  const createdRequest =await FrienRequest.findById(frienRequest._id);
  if (!createdRequest) throw new ApiError(400, "request does not geanrated");
  return res.status(200).json(new ApiResponse(400, "request created"));
});

export {makeRequest}