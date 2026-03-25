import { modelOptions, prop } from "@typegoose/typegoose";
import mongoose from "mongoose";

export abstract class BaseModel {
  public _id!: mongoose.Types.ObjectId;
  public createdAt!: Date;
  public updatedAt!: Date;
}
