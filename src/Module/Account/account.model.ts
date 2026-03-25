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
    collection: "accounts",
  },
})
export class Account extends BaseModel {
  @prop({ required: true, type: () => String })
  public account!: string;

  @prop({
    ref: () => User,
    type: () => mongoose.Schema.Types.ObjectId,
  })
  public user?: Ref<User>;
}

export const AccountModel = getModelForClass(Account);
