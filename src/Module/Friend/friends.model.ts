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
    collection: "friends",
  },
})
export class Friend extends BaseModel {
  @prop({
    type: () => [mongoose.Schema.Types.ObjectId],
    ref: () => "User",
    required: true,
    validate: {
      validator: (val: mongoose.Types.ObjectId[]) => val.length === 2,
      message: "Friend must contain exactly 2 users",
    },
  })
  public users!: Ref<any>[];
}

export const FriendModel = getModelForClass(Friend);