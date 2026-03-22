import mongoose, { Schema } from "mongoose";
const expenseSchema = mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    isGiven: {
      type: Boolean,
      required: true,
    },
    account: {
      type: Schema.Types.ObjectId,
      ref:"Account",
      required: true,
    },
    date: {
    type: Date,
    required: true,
  },
  },
  {
    timestamps: true,
  },
);
export const Expense = mongoose.model("Expense", expenseSchema);
