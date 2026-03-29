import {
  modelOptions,
  prop,
  Ref,
  getModelForClass,
} from "@typegoose/typegoose";
import mongoose from "mongoose";
import { BaseModel } from "../../Base/Base.model";

@modelOptions({
  schemaOptions: {
    timestamps: true,
    collection: "friendRequests",
  },
})
export class FriendRequest extends BaseModel {
  @prop({
    ref: () => "User",
    type: () => mongoose.Schema.Types.ObjectId,
    required: true,
  })
  public requestTo!: Ref<any>;

  @prop({
    ref: () => "User",
    type: () => mongoose.Schema.Types.ObjectId,
    required: true,
  })
  public requestFrom!: Ref<any>;
}

export const FriendRequestModel = getModelForClass(FriendRequest);