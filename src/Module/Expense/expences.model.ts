import {
  modelOptions,
  prop,
  Ref,
  getModelForClass,
} from "@typegoose/typegoose";
import mongoose from "mongoose";
import { BaseModel } from "../../Base/Base.model";

export enum Category {
  FOOD = "food",
  TRAVEL = "travel",
  SHOPPING = "shopping",
  BILLS = "bills",
}
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

  @prop({
    required: true,
    enum: Category,
    type: () => String,
  })
  public category!: Category;

  @prop({
    ref: () => "User",
    type: () => mongoose.Schema.Types.ObjectId,
  })
  public user?: Ref<any>;

  @prop({ required: true, type: () => Date })
  public date!: Date;

  @prop({
    ref: "Account",
    type: () => mongoose.Schema.Types.ObjectId,
  })
  public account?: Ref<any>;
}

export const ExpenseModel = getModelForClass(Expense);
