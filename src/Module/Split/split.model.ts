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
    collection: "splits",
  },
})
export class Split extends BaseModel {
  @prop({
    ref: () => "User",
    type: () => mongoose.Schema.Types.ObjectId,
    required: true,
  })
  public splitFrom!: Ref<any>;

  @prop({
    ref: () => "User",
    type: () => mongoose.Schema.Types.ObjectId,
    required: true,
  })
  public splitTo!: Ref<any>;

  @prop({ required: true, type: () => Number })
  public amount!: number;

  @prop({ required: true, type: () => String, trim: true })
  public description!: string;
}

export const SplitModel = getModelForClass(Split);