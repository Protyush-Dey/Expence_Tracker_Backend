import {
  modelOptions,
  prop,
  Ref,
  getModelForClass,
} from "@typegoose/typegoose";
import mongoose from "mongoose";
import { BaseModel } from "../../Base/Base.model";
import { User } from "../User/user.model";

@modelOptions({
  schemaOptions: {
    timestamps: true,
    collection: "friend_requests",
  },
})
export class FriendRequest extends BaseModel {
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