import { ApiError } from "../../utils/ApiError";
import { db } from "../../config/mysqlconfig";
import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
// import { BaseService } from "../../Base/Base.service";
// import { User, UserModel } from "./user.model";
// import { AccountModel } from "../Account/account.model";
// import { generateOTP } from "../../utils/otp"; // plug in your OTP util
// import { ExpenseModel } from "../Expense/expences.model";
// import mongoose from "mongoose";

export class UserService {
  // Token Helpers

  generateAccessToken(user: { id: number; email: string; username: string }) {
    const secret = process.env.ACCESS_TOKEN_SECRET;
    const expiry = process.env.ACCESS_TOKEN_EXPIRY;

    if (!secret || !expiry) {
      throw new Error("ACCESS_TOKEN env vars missing");
    }

    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        username: user.username,
      },
      secret,
      {
        expiresIn: expiry as SignOptions["expiresIn"],
      },
    );
  }

  generateRefreshToken(userId: number) {
    const secret = process.env.REFRESH_TOKEN_SECRET;
    const expiry = process.env.REFRESH_TOKEN_EXPIRY;

    if (!secret || !expiry) {
      throw new Error("REFRESH_TOKEN env vars missing");
    }

    return jwt.sign(
      {
        id: userId,
      },
      secret,
      {
        expiresIn: expiry as SignOptions["expiresIn"],
      },
    );
  }

  async generateTokens(userId: string) {
    const [MyUser]: any = await db.execute(
      `SELECT id
      FROM users
      WHERE id = ?
      `,
      [userId],
    );
    if (MyUser.length === 0) throw new ApiError(404, "User not found");
    const user = MyUser[0];

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user.id);

    await db.execute(
      `
      UPDATE users
      SET refresh_token = ?
      WHERE id = ?
      `,
      [refreshToken, user.id],
    );

    return { accessToken, refreshToken };
  }

  // password cheak
  private async isPasswordCorrect(
    enteredPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(enteredPassword, hashedPassword);
  }

  // register the user
  async registerUser(data: {
    userName: string;
    fullName: string;
    email: string;
    password: string;
  }) {
    const { userName, fullName, email, password } = data;

    const [exists]: any = await db.execute(
      `SELECT id
    FROM users
    WHERE email = ? OR userName = ?
    `,
      [email, userName.toLowerCase()],
    );
    if (exists.length > 0) throw new ApiError(409, "User already exists");

    const passwordHash = await bcrypt.hash(password, 10);

    const [createUser]: any = await db.execute(
      `INSERT INTO users (
      userName,
      fullName,
      email,
      password_hash)
      VALUES(?,?,?,?)
      `,
      [userName.toLowerCase(), fullName, email, passwordHash],
    );
    const [user]: any = await db.execute(
      `SELECT id FROM users WHERE email = ?`,
      [email],
    );

    const userId = user[0].id;

    const [accountResult]: any = await db.execute(
      `INSERT INTO accounts ( account_name,
      user_id,
      type
      )
      VALUES (?, ?, ?)
      `,
      ["cash", userId, "cash"],
    );

    const [users]: any = await db.execute(
      `
    SELECT
      id
    FROM users
    WHERE id = ?
    `,
      [userId],
    );

    if (users.length === 0) {
      throw new ApiError(500, "User creation failed");
    }

    return;
  }

  // login the user
  async loginUser(loginInfo: string, password: string) {
    const [existsUser]: any = await db.execute(
      `SELECT id,
    userName,
    fullName,
    email,
    password_hash 
    FROM users
    WHERE email = ? OR username = ?
    `,
      [loginInfo, loginInfo.toLowerCase()],
    );
    if (existsUser.length === 0)
      throw new ApiError(404, `User not found${existsUser.length}`);
    const user = existsUser[0];
    const isValid = await this.isPasswordCorrect(password, user.password_hash);
    if (!isValid) throw new ApiError(401, "Incorrect password");

    const { accessToken, refreshToken } = await this.generateTokens(
      String(user.id),
    );

    const [data]: any = await db.execute(
      `SELECT 
      id,userName,fullName,email 
      from users
      where id = ?`,
      [user.id],
    );
    const loginData = data[0];
    return { loginData, accessToken, refreshToken };
  }

  // logout the user
  async logoutUser(userId: string) {
    await db.execute(
      `
        UPDATE users
      SET refresh_token = NULL 
        WHERE id = ?
        `,
      [userId],
    );
  }

  //   //me
  async me(userId: string) {
    const [existsUser]: any = await db.execute(
      `SELECT 
        id,email,userName,fullName
        FROM users
        WHERE id=?`,
      [userId],
    );
    if (existsUser.length === 0) throw new ApiError(404, "user not found");
    const user = existsUser[0];
    return user;
  }
  //     // reset refresh token
  //   async resetRefreshToken(incomingRefToken: string) {
  //     const secret = process.env.REFRESH_TOKEN_SECRET;
  //     if (!secret) throw new ApiError(500, "REFRESH_TOKEN_SECRET not configured");

  //     const decoded = jwt.verify(incomingRefToken, secret) as { _id: string };
  //     const user = await UserModel.findById(decoded._id);
  //     if (!user) throw new ApiError(401, "Invalid token");
  //     if (user.refreshToken !== incomingRefToken)
  //       throw new ApiError(401, "Refresh token expired or already used");

  //     return this.generateTokens(String(user._id));
  //   }

  //   //forgot password
  //   async initForgotPassword(email: string) {
  //     const user = await UserModel.findOne({ email });
  //     if (!user) throw new ApiError(404, "Account does not exist");

  //     const otp = generateOTP();
  //     user.passwordResetOTP = otp;
  //     user.passwordResetExpires = new Date(Date.now() + 5 * 60 * 1000);
  //     await user.save({ validateBeforeSave: false });

  //     // TODO: plug in your mailer
  //     return otp;
  //   }

  //   //verify otp for password
  //   async verifyOtp(email: string, otp: string) {
  //     const user = await UserModel.findOne({
  //       email,
  //       passwordResetOTP: otp,
  //       passwordResetExpires: { $gt: new Date() },
  //     });
  //     if (!user) throw new ApiError(400, "Invalid or expired OTP");
  //     return this.generateOtpToken(String(user._id));
  //   }

  //   // update password
  //   async updatePassword(userId: string, password: string) {
  //     const user = await UserModel.findById(userId);
  //     if (!user) throw new ApiError(404, "User not found");
  //     user.password = password;
  //     //user.passwordResetToken = undefined;
  //     await user.save({ validateBeforeSave: false });
  //   }

  //   // find a user
  //   async findUser(loginInfo: string) {
  //     const user = await UserModel.findOne({
  //       $or: [{ email: loginInfo.trim() }, { userName: loginInfo.trim() }],
  //     }).select("userName email fullName");
  //     if (!user) throw new ApiError(404, "No account found");
  //     return user;
  //   }

  //   // grt expense with dates
  // async getExpenseOfUserByDates(userId: string, startDate?: string, endDate?: string) {
  //   let start: Date;
  //   let end: Date;

  //   if (!startDate || !endDate) {
  //     start = new Date();
  //     start.setDate(1);
  //     start.setHours(0, 0, 0, 0);

  //     end = new Date();
  //     end.setMonth(end.getMonth() + 1);
  //     end.setDate(0);
  //     end.setHours(23, 59, 59, 999);
  //   } else {
  //     start = new Date(startDate);
  //     end = new Date(endDate);
  //   }

  //   const expenses = await ExpenseModel.aggregate([
  //     {
  //       $match: {
  //         date: { $gte: start, $lte: end },
  //       },
  //     },
  //     {
  //       $lookup: {
  //         from: "accounts",
  //         localField: "account",
  //         foreignField: "_id",
  //         as: "accounts",
  //       },
  //     },
  //     { $unwind: "$accounts" },
  //     {
  //       $match: {
  //         "accounts.user": new mongoose.Types.ObjectId(userId),
  //       },
  //     },
  //     {
  //       $project: {
  //         _id: 1,
  //         expenseId: "$_id",
  //         amount: "$amount",
  //         desc: "$description",
  //         date: "$date",
  //         isGiven: "$isGiven",
  //         account: "$account",
  //       },
  //     },
  //     { $sort: { date: -1 } },
  //   ]);

  //   return expenses;
  // }

  //   // change Primary acc
  //   async changePrimaryAccount(userId: string, accountId: string) {
  //     const account = await AccountModel.findById(accountId);
  //     if (!account) throw new ApiError(404, "Account not found");
  //     this.assertOwnership(String(account.user), userId);

  //     const user = await UserModel.findById(userId);
  //     if (!user) throw new ApiError(404, "User not found");
  //     if (
  //   String(user.cashAccount) === accountId ||
  //   String(user.primaryAccount) === accountId
  // )
  //       throw new ApiError(400, "Choose a different account");

  //     user.primaryAccount = account._id;
  //     await user.save({ validateBeforeSave: false });
  //   }
}
