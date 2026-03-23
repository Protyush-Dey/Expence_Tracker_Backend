import { modelOptions, prop, Ref } from "@typegoose/typegoose";
import { Account } from "../Account/account.model";
import mongoose from "mongoose";

@modelOptions({
  schemaOptions: {
    timestamps: true,
    collection: "users",
  },
})
export class Expense {
  @prop({
    required: true,
    type: () => String,
  })
  public amount!: string;

  @prop({
    required: true,
    type: () => String,
  })
  public description!: string;

  @prop({
    required: true,
    type: () => Boolean,
  })
  public sGiven!: boolean;

  @prop({
    required: true,
    type: () => Date,
  })
  public date!: Date;

  @prop({
    ref: "Account",
    type: () => mongoose.Schema.Types.ObjectId,
  })
  public account?: Ref<Account>;
}
