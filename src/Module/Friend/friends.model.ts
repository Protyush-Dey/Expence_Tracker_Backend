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
    collection: "friends",
  },
})
export class Friend {
  @prop({
    type: () => [mongoose.Schema.Types.ObjectId],
    ref: () => User,
    required: true,
    validate: {
      validator: (val: mongoose.Types.ObjectId[]) => val.length === 2,
      message: "Friend must contain exactly 2 users",
    },
  })
  public users!: Ref<User>[];
}

export const FriendModel = getModelForClass(Friend);