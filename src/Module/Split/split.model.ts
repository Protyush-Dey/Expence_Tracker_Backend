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
    collection: "splits",
  },
})
export class Split {
  @prop({
    ref: () => User,
    type: () => mongoose.Schema.Types.ObjectId,
    required: true,
  })
  public splitFrom!: Ref<User>;

  @prop({
    ref: () => User,
    type: () => mongoose.Schema.Types.ObjectId,
    required: true,
  })
  public splitTo!: Ref<User>;

  @prop({
    required: true,
    type: () => Number,
  })
  public amount!: number;

  @prop({
    required: true,
    type: () => String,
    trim: true,
  })
  public description!: string;
}

export const SplitModel = getModelForClass(Split);