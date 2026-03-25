import { modelOptions, prop, Ref, getModelForClass } from "@typegoose/typegoose";
import mongoose from "mongoose";
import { BaseModel } from "../../Base/Base.model";
import { Account } from "../Account/account.model";

@modelOptions({
  schemaOptions: {
    timestamps: true,
    collection: "expenses",
  },
})
export class Expense extends BaseModel {
  @prop({ required: true, type: () => Number })
  public amount!: number; // fixed: was `string` in original

  @prop({ required: true, type: () => String })
  public description!: string;

  @prop({ required: true, type: () => Boolean })
  public isGiven!: boolean; // fixed: was `sGiven` in original

  @prop({ required: true, type: () => Date })
  public date!: Date;

  @prop({
    ref: () => Account,
    type: () => mongoose.Schema.Types.ObjectId,
  })
  public account?: Ref<Account>;
}

export const ExpenseModel = getModelForClass(Expense);