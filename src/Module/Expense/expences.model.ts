import { modelOptions, prop, Ref, getModelForClass } from "@typegoose/typegoose";
import mongoose from "mongoose";
import { BaseModel } from "../../Base/Base.model";

@modelOptions({
  schemaOptions: {
    timestamps: true,
    collection: "expenses",
  },
})
export class Expense extends BaseModel {
  @prop({ required: true, type: () => Number })
  public amount!: number; 

  @prop({ required: true, type: () => String })
  public description!: string;

  @prop({ required: true, type: () => Boolean })
  public isGiven!: boolean; 

  @prop({ required: true, type: () => Date })
  public date!: Date;

  @prop({
    ref: "Account",  // ✅ FIXED
    type: () => mongoose.Schema.Types.ObjectId,
  })
  public account?: Ref<any>; // ✅ avoid importing Account
}

export const ExpenseModel = getModelForClass(Expense);