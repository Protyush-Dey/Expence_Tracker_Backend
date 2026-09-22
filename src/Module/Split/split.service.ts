import { ApiError } from "../../utils/ApiError";
import { prisma } from "../../config/prisma";

export enum Category {
  FOOD = "FOOD",
  TRAVEL = "TRAVEL",
  SHOPPING = "SHOPPING",
  BILLS = "BILLS",
}

export class SplitService {
  // create split to one friend
  async createSingleSplit(data: {
    splitFrom: string;
    splitTo: string;
    amount: number;
    description: string;
  }) {
    const split = await prisma.split.create({
      data: {
        splitFromId: data.splitFrom,
        splitToId: data.splitTo,
        amount: Number(data.amount),
        description: data.description,
      },
    });

    return {
      ...split,
      _id: split.id,
      splitFrom: split.splitFromId,
      splitTo: split.splitToId,
    };
  }

  // make a group split
  async createBulkSplits(
    userId: string,
    description: string,
    details: Array<{ splitTo: string; amount: number }>
  ) {
    const splits = details.map((d) => ({
      splitFromId: userId,
      splitToId: d.splitTo,
      amount: Number(d.amount),
      description,
    }));

    await prisma.split.createMany({
      data: splits,
    });
  }

  // get all splits to pay
  async getDueToGive(userId: string, friendId: string) {
    const splits = await prisma.split.findMany({
      where: {
        splitFromId: friendId,
        splitToId: userId,
      },
      orderBy: { createdAt: "desc" },
    });

    const totalAmount = splits.reduce((sum, s) => sum + s.amount, 0);

    return [
      {
        _id: null,
        totalAmount,
        splits: splits.map((s) => ({
          ...s,
          _id: s.id,
          splitFrom: s.splitFromId,
          splitTo: s.splitToId,
        })),
      },
    ];
  }

  // get all splits to be paid
  async getDueToGet(userId: string, friendId: string) {
    const splits = await prisma.split.findMany({
      where: {
        splitFromId: userId,
        splitToId: friendId,
      },
      orderBy: { createdAt: "desc" },
    });

    const totalAmount = splits.reduce((sum, s) => sum + s.amount, 0);

    return [
      {
        _id: null,
        totalAmount,
        splits: splits.map((s) => ({
          ...s,
          _id: s.id,
          splitFrom: s.splitFromId,
          splitTo: s.splitToId,
        })),
      },
    ];
  }

  // delete split
  async deleteSplit(userId: string, splitId: string) {
    const split = await prisma.split.findUnique({
      where: { id: splitId },
    });
    if (!split) throw new ApiError(404, "Split not found");
    this.assertOwnership(split.splitFromId, userId);

    await prisma.split.delete({
      where: { id: splitId },
    });
  }

  // pay all due
  async payAllDue(userId: string, friendId: string) {
    const splits = await prisma.split.findMany({
      where: {
        splitFromId: friendId,
        splitToId: userId,
      },
    });
    if (!splits.length) throw new ApiError(404, "No due splits found");

    const totalAmount = splits.reduce((sum, s) => sum + s.amount, 0);
    const [userFrom, userTo] = await this._resolveUsers(friendId, userId);

    const accountFrom = userFrom.primaryAccountId || userFrom.cashAccountId;
    const accountTo = userTo.primaryAccountId || userTo.cashAccountId;

    if (!accountFrom || !accountTo) {
      throw new ApiError(400, "Account not found for transaction");
    }

    await prisma.$transaction(async (tx) => {
      await tx.expense.create({
        data: {
          amount: totalAmount,
          description: `Splits from (${userTo.fullName})`,
          isGiven: false,
          category: Category.BILLS,
          accountId: accountFrom,
          userId: userFrom.id,
          date: new Date(),
        },
      });

      await tx.expense.create({
        data: {
          amount: totalAmount,
          description: `Splits to (${userFrom.fullName})`,
          isGiven: true,
          category: Category.BILLS,
          accountId: accountTo,
          userId: userTo.id,
          date: new Date(),
        },
      });

      await tx.split.deleteMany({
        where: {
          id: { in: splits.map((s) => s.id) },
        },
      });
    });
  }

  // pay one due
  async payOneDue(userId: string, splitId: string) {
    const split = await prisma.split.findUnique({
      where: { id: splitId },
    });
    if (!split) throw new ApiError(404, "Split not found");
    // userId must be splitTo (the recipient who is being paid back)
    this.assertOwnership(split.splitToId, userId);

    const [userFrom, userTo] = await this._resolveUsers(
      split.splitFromId,
      userId
    );

    const accountFrom = userFrom.primaryAccountId || userFrom.cashAccountId;
    const accountTo = userTo.primaryAccountId || userTo.cashAccountId;

    if (!accountFrom || !accountTo) {
      throw new ApiError(400, "Account not found for transaction");
    }

    await prisma.$transaction(async (tx) => {
      await tx.expense.create({
        data: {
          amount: split.amount,
          description: `${split.description} from (${userTo.fullName})`,
          isGiven: false,
          category: Category.BILLS,
          accountId: accountFrom,
          userId: userFrom.id,
          date: new Date(),
        },
      });

      await tx.expense.create({
        data: {
          amount: split.amount,
          description: `${split.description} to (${userFrom.fullName})`,
          isGiven: true,
          category: Category.BILLS,
          accountId: accountTo,
          userId: userTo.id,
          date: new Date(),
        },
      });

      await tx.split.delete({
        where: { id: splitId },
      });
    });
  }

  // mark all due done
  async markAllDueDone(userId: string, friendId: string) {
    const splits = await prisma.split.findMany({
      where: {
        splitFromId: userId,
        splitToId: friendId,
      },
    });
    if (!splits.length) throw new ApiError(404, "No splits found");

    const totalAmount = splits.reduce((sum, s) => sum + s.amount, 0);
    const [userFrom, userTo] = await this._resolveUsers(friendId, userId);

    const accountFrom = userFrom.cashAccountId || userFrom.primaryAccountId;
    const accountTo = userTo.cashAccountId || userTo.primaryAccountId;

    if (!accountFrom || !accountTo) {
      throw new ApiError(400, "Cash account not found");
    }

    await prisma.$transaction(async (tx) => {
      await tx.expense.create({
        data: {
          amount: totalAmount,
          description: `Splits from (${userTo.fullName})`,
          isGiven: false,
          category: Category.BILLS,
          accountId: accountFrom,
          userId: userFrom.id,
          date: new Date(),
        },
      });

      await tx.expense.create({
        data: {
          amount: totalAmount,
          description: `Splits to (${userFrom.fullName})`,
          isGiven: true,
          category: Category.BILLS,
          accountId: accountTo,
          userId: userTo.id,
          date: new Date(),
        },
      });

      await tx.split.deleteMany({
        where: {
          id: { in: splits.map((s) => s.id) },
        },
      });
    });
  }

  // mark one due done
  async markOneDueDone(userId: string, splitId: string) {
    const split = await prisma.split.findUnique({
      where: { id: splitId },
    });
    if (!split) throw new ApiError(404, "Split not found");
    this.assertOwnership(split.splitFromId, userId);

    const [userTo, user] = await this._resolveUsers(
      split.splitToId,
      userId
    );

    const accountFrom = user.cashAccountId || user.primaryAccountId;
    const accountTo = userTo.cashAccountId || userTo.primaryAccountId;

    if (!accountFrom || !accountTo) {
      throw new ApiError(400, "Cash account not found");
    }

    await prisma.$transaction(async (tx) => {
      await tx.expense.create({
        data: {
          amount: split.amount,
          description: `${split.description} from (${userTo.fullName})`,
          isGiven: false,
          category: Category.BILLS,
          accountId: accountFrom,
          userId: user.id,
          date: new Date(),
        },
      });

      await tx.expense.create({
        data: {
          amount: split.amount,
          description: `${split.description} to (${user.fullName})`,
          isGiven: true,
          category: Category.BILLS,
          accountId: accountTo,
          userId: userTo.id,
          date: new Date(),
        },
      });

      await tx.split.delete({
        where: { id: splitId },
      });
    });
  }

  // Private Helpers
  private async _resolveUsers(idA: string, idB: string) {
    const [userA, userB] = await Promise.all([
      prisma.user.findUnique({ where: { id: idA } }),
      prisma.user.findUnique({ where: { id: idB } }),
    ]);
    if (!userA || !userB)
      throw new ApiError(404, "One or both users not found");
    return [userA, userB] as const;
  }

  private assertOwnership(ownerId: string, resourceOwnerId: string): void {
    if (String(ownerId) !== String(resourceOwnerId)) {
      throw new ApiError(403, "Access denied");
    }
  }
}