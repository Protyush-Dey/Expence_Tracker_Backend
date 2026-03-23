import mongoose from "mongoose";
import {
  modelOptions,
  prop,
  Ref,
  getModelForClass,
} from "@typegoose/typegoose";
import { User } from "../User/user.model.js";

@modelOptions({
  schemaOptions: {
    timestamps: true,
    collection: "friend_requests",
  },
})
export class FriendRequest {
  @prop({
    ref: () => User,
    type: () => mongoose.Schema.Types.ObjectId,
    required: true,
  })
  public requestTo!: Ref<User>;

  @prop({
    ref: () => User,
    type: () => mongoose.Schema.Types.ObjectId,
    required: true,
  })
  public requestFrom!: Ref<User>;
}

export const FriendRequestModel = getModelForClass(FriendRequest);