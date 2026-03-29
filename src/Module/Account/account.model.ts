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
    collection: "accounts",
  },
})
export class Account extends BaseModel {
  @prop({ required: true, type: () => String })
  public account!: string;

  @prop({
    ref: () => "User",          // string reference instead of importing User
    type: () => mongoose.Schema.Types.ObjectId,
  })
  public user?: Ref<any>;       // use Ref<any> to avoid importing User
}

export const AccountModel = getModelForClass(Account);