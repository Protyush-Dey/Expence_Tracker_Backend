import mongoose from "mongoose";
import { ApiError } from "../../utils/ApiError";
import { BaseService } from "../../Base/Base.service";
import { Split, SplitModel } from "./split.model";
import { ExpenseModel } from "../Expense/expences.model";
import { UserModel } from "../User/user.model";

export class SplitService extends BaseService<Split> {
  constructor() {
    super(SplitModel);
  }

//create split to one friend
  async createSingleSplit(data: {
    splitFrom: string;
    splitTo: string;
    amount: number;
    description: string;
  }) {
    const split = await this.create({
      splitFrom: new mongoose.Types.ObjectId(data.splitFrom),
      splitTo: new mongoose.Types.ObjectId(data.splitTo),
      amount: data.amount,
      description: data.description,
    });
    return split;
  }

  // make a group split
  async createBulkSplits(
    userId: string,
    description: string,
    details: Array<{ splitTo: string; amount: number }>
  ) {
    const splits = details.map((d) => ({
      splitFrom: new mongoose.Types.ObjectId(userId),
      splitTo: new mongoose.Types.ObjectId(d.splitTo),
      amount: d.amount,
      description,
    }));
    await SplitModel.insertMany(splits);
  }


  // gat all splits to pay
  async getDueToGive(userId: string, friendId: string) {
    return SplitModel.aggregate([
      {
        $match: {
          splitFrom: new mongoose.Types.ObjectId(friendId),
          splitTo: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          splits: { $push: "$$ROOT" },
        },
      },
    ]);
  }


  // gat all splits tobe paid
  async getDueToGet(userId: string, friendId: string) {
    return SplitModel.aggregate([
      {
        $match: {
          splitFrom: new mongoose.Types.ObjectId(userId),
          splitTo: new mongoose.Types.ObjectId(friendId),
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          splits: { $push: "$$ROOT" },
        },
      },
    ]);
  }


  // detlete split from split from
  async deleteSplit(userId: string, splitId: string) {
    const split = await SplitModel.findById(splitId);
    if (!split) throw new ApiError(404, "Split not found");
    this.assertOwnership(String(split.splitFrom), userId);
    await SplitModel.findByIdAndDelete(splitId);
  }



  // pay all due
  async payAllDue(userId: string, friendId: string) {
    const splits = await SplitModel.find({
      splitFrom: new mongoose.Types.ObjectId(friendId),
      splitTo: new mongoose.Types.ObjectId(userId),
    });
    if (!splits.length) throw new ApiError(404, "No due splits found");

    const totalAmount = splits.reduce((sum, s) => sum + s.amount, 0);
    const [userFrom, userTo] = await this._resolveUsers(friendId, userId);

    const accountFrom = userFrom.primaryAccount ?? userFrom.cashAccount;
    const accountTo = userTo.primaryAccount ?? userTo.cashAccount;

    await Promise.all([
      ExpenseModel.create({
        amount: totalAmount,
        description: `Splits from (${userTo.fullName})`,
        isGiven: false,
        account: accountFrom,
        date: new Date(),
      }),
      ExpenseModel.create({
        amount: totalAmount,
        description: `Splits to (${userFrom.fullName})`,
        isGiven: true,
        account: accountTo,
        date: new Date(),
      }),
    ]);

    await SplitModel.deleteMany({ _id: { $in: splits.map((s) => s._id) } });
  }


  // pay all due
  async payOneDue(userId: string, splitId: string) {
    const split = await SplitModel.findById(splitId);
    if (!split) throw new ApiError(404, "Split not found");
    // userId must be the splitTo (the one being paid back)
    this.assertOwnership(String(split.splitTo), userId);

    const [userFrom, userTo] = await this._resolveUsers(
      String(split.splitFrom),
      userId
    );

    const accountFrom = userFrom.primaryAccount ?? userFrom.cashAccount;
    const accountTo = userTo.primaryAccount ?? userTo.cashAccount;

    await Promise.all([
      ExpenseModel.create({
        amount: split.amount,
        description: `${split.description} from (${userTo.fullName})`,
        isGiven: false,
        account: accountFrom,
        date: new Date(),
      }),
      ExpenseModel.create({
        amount: split.amount,
        description: `${split.description} to (${userFrom.fullName})`,
        isGiven: true,
        account: accountTo,
        date: new Date(),
      }),
    ]);

    await SplitModel.findByIdAndDelete(splitId);
  }


  //mark pay all due
  async markAllDueDone(userId: string, friendId: string) {
    const splits = await SplitModel.find({
      splitFrom: new mongoose.Types.ObjectId(userId),
      splitTo: new mongoose.Types.ObjectId(friendId),
    });
    if (!splits.length) throw new ApiError(404, "No splits found");

    const totalAmount = splits.reduce((sum, s) => sum + s.amount, 0);
    const [userFrom, userTo] = await this._resolveUsers(friendId, userId);

    await Promise.all([
      ExpenseModel.create({
        amount: totalAmount,
        description: `Splits from (${userTo.fullName})`,
        isGiven: false,
        account: userFrom.cashAccount,
        date: new Date(),
      }),
      ExpenseModel.create({
        amount: totalAmount,
        description: `Splits to (${userFrom.fullName})`,
        isGiven: true,
        account: userTo.cashAccount,
        date: new Date(),
      }),
    ]);

    await SplitModel.deleteMany({ _id: { $in: splits.map((s) => s._id) } });
  }

  

  //mark pay one
  async markOneDueDone(userId: string, splitId: string) {
    const split = await SplitModel.findById(splitId);
    if (!split) throw new ApiError(404, "Split not found");
    this.assertOwnership(String(split.splitFrom), userId);
    const [userTo, user] = await this._resolveUsers(
      String(split.splitTo),
      userId
    );

    await Promise.all([
      ExpenseModel.create({
        amount: split.amount,
        description: `${split.description} from (${userTo.fullName})`,
        isGiven: false,
        account: user.cashAccount,
        date: new Date(),
      }),
      ExpenseModel.create({
        amount: split.amount,
        description: `${split.description} to (${user.fullName})`,
        isGiven: true,
        account: userTo.cashAccount,
        date: new Date(),
      }),
    ]);

    await SplitModel.findByIdAndDelete(splitId);
  }

  //Private Helpers 

  private async _resolveUsers(idA: string, idB: string) {
    const [userA, userB] = await Promise.all([
      UserModel.findById(idA),
      UserModel.findById(idB),
    ]);
    if (!userA || !userB) throw new ApiError(404, "One or both users not found");
    return [userA, userB] as const;
  }
}