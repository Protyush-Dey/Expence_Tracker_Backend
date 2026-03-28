import mongoose from "mongoose";
import { ApiError } from "../../utils/ApiError";
import { BaseService } from "../../Base/Base.service";
import { Friend, FriendModel } from "./friends.model";
import { FriendRequestModel } from "./friendRequest.model";
import { UserModel } from "../User/user.model";

export class FriendService extends BaseService<Friend> {
  constructor() {
    super(FriendModel);
  }


  //make request
  async makeRequest(userId: string, requestTo: string) {
    if (requestTo == userId) throw new ApiError(400, "Cannot send request to yourself");

    const target = await UserModel.findById(requestTo);
    if (!target) throw new ApiError(404, "User not found");
    const alreadyExists = await FriendRequestModel.exists({
      $or: [
        { requestFrom: userId, requestTo },
        { requestFrom: requestTo, requestTo: userId },
      ],
    });
    if (alreadyExists) throw new ApiError(409, "Friend request already exists");

    return FriendRequestModel.create({
      requestTo: new mongoose.Types.ObjectId(requestTo),
      requestFrom: new mongoose.Types.ObjectId(userId),
    });
  }


  //reject request
  async rejectRequest(userId: string, requestId: string) {
    const request = await FriendRequestModel.findById(requestId);
    if (!request) throw new ApiError(404, "Request not found");
    this.assertOwnership(String(request.requestTo), userId);
    await FriendRequestModel.findByIdAndDelete(requestId);
  }


    // delete request
  async deleteRequest(userId: string, requestId: string) {
    const request = await FriendRequestModel.findById(requestId);
    if (!request) throw new ApiError(404, "Request not found");
    // Only the sender can delete their own request
    this.assertOwnership(String(request.requestFrom), userId);
    await FriendRequestModel.findByIdAndDelete(requestId);
  }


   // get all friend Recieved request 
  async getAllRequestsReceived(userId: string) {
    return FriendRequestModel.aggregate([
      { $match: { requestTo: new mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: "users",
          localField: "requestFrom",
          foreignField: "_id",
          as: "sender",
        },
      },
      { $unwind: "$sender" },
      {
        $project: {
          _id: 1,
          createdAt: 1,
          senderName: "$sender.userName",
          senderFullName: "$sender.fullName",
        },
      },
    ]);
  }



  // get all friend sened request
  async getAllRequestsSent(userId: string) {
    return FriendRequestModel.aggregate([
      { $match: { requestFrom: new mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: "users",
          localField: "requestTo",
          foreignField: "_id",
          as: "receiver",
        },
      },
      { $unwind: "$receiver" },
      {
        $project: {
          _id: 1,
          createdAt: 1,
          receiverName: "$receiver.userName",
          receiverEmail: "$receiver.email",
          receiverFullName: "$receiver.fullName",
        },
      },
    ]);
  }

  async acceptRequest(userId: string, requestId: string) {
    const request = await FriendRequestModel.findById(requestId);
    if (!request) throw new ApiError(404, "Request not found");
    // Only the recipient can accept
    this.assertOwnership(String(request.requestTo), userId);

    const friend = await FriendModel.create({
      users: [
        new mongoose.Types.ObjectId(userId),
        new mongoose.Types.ObjectId(String(request.requestFrom)),
      ],
    });

    await FriendRequestModel.findByIdAndDelete(requestId);
    return friend;
  }

  async getAllFriends(userId: string) {
    return FriendModel.aggregate([
      { $match: { users: new mongoose.Types.ObjectId(userId) } },
      {
        $project: {
          friendId: {
            $arrayElemAt: [
              {
                $setDifference: [
                  "$users",
                  [new mongoose.Types.ObjectId(userId)],
                ],
              },
              0,
            ],
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "friendId",
          foreignField: "_id",
          as: "friend",
        },
      },
      { $unwind: "$friend" },
      {
        $project: {
          _id: "$friend._id",
          email: "$friend.email",
          userName: "$friend.userName",
          fullName: "$friend.fullName",
        },
      },
    ]);
  }
}