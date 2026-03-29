import jwt from "jsonwebtoken";
import { ApiError } from "../../utils/ApiError";
import { BaseService } from "../../Base/Base.service";
console.log("user");
import { User, UserModel } from "./user.model";
console.log("account");
import { AccountModel } from "../Account/account.model";
import { generateOTP } from "../../utils/otp"; // plug in your OTP util
console.log("exp");
import { ExpenseModel } from "../Expense/expences.model";
import mongoose from "mongoose";

export class UserService extends BaseService<User> {
  constructor() {
    super(UserModel);
  }

  // ─── Token Helpers ────────────────────────────────────────────────────────

  async generateTokens(userId: string) {
    const user = await UserModel.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  }

  private async generateOtpToken(userId: string): Promise<string> {
    const user = await UserModel.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    const otpToken = user.generateOtpToken();
    //user.passwordResetToken = otpToken;
    user.passwordResetOTP = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return otpToken;
  }


  // register the user
  async registerUser(data: {
    userName: string;
    fullName: string;
    email: string;
    password: string;
  }) {
    const { userName, fullName, email, password } = data;

    const exists = await this.exists({
      $or: [{ email }, { userName: userName.toLowerCase() }],
    });
    if (exists) throw new ApiError(409, "User already exists");

    const user = await this.create({ userName, fullName, email, password });

    const cashAccount = await AccountModel.create({
      account: "cash",
      user: user._id,
    });

    await UserModel.findByIdAndUpdate(
      user._id,
      { cashAccount: cashAccount._id },
      { new: true }
    );

    const createdUser = await UserModel.findById(user._id).select(
      "-password -refreshToken"
    );
    if (!createdUser) throw new ApiError(500, "User creation failed");

    return createdUser;
  }


  // login the user
  async loginUser(loginInfo: string, password: string) {
    const user = await UserModel.findOne({
      $or: [{ email: loginInfo.trim() }, { userName: loginInfo.trim() }],
    });
    if (!user) throw new ApiError(404, "User not found");

    const isValid = await user.isPasswordCorrect(password);
    if (!isValid) throw new ApiError(401, "Incorrect password");

    const { accessToken, refreshToken } = await this.generateTokens(
      String(user._id)
    );

    const loginData = await UserModel.findById(user._id).select(
      "-password -refreshToken -cashAccount -primaryAccount"
    );

    return { loginData, accessToken, refreshToken };
  }


  // logout the user
  async logoutUser(userId: string) {
    await UserModel.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });
  }


    // reset refresh token
  async resetRefreshToken(incomingRefToken: string) {
    const secret = process.env.REFRESH_TOKEN_SECRET;
    if (!secret) throw new ApiError(500, "REFRESH_TOKEN_SECRET not configured");

    const decoded = jwt.verify(incomingRefToken, secret) as { _id: string };
    const user = await UserModel.findById(decoded._id);
    if (!user) throw new ApiError(401, "Invalid token");
    if (user.refreshToken !== incomingRefToken)
      throw new ApiError(401, "Refresh token expired or already used");

    return this.generateTokens(String(user._id));
  }


  //forgot password
  async initForgotPassword(email: string) {
    const user = await UserModel.findOne({ email });
    if (!user) throw new ApiError(404, "Account does not exist");

    const otp = generateOTP();
    user.passwordResetOTP = otp;
    user.passwordResetExpires = new Date(Date.now() + 5 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    // TODO: plug in your mailer
    return otp;
  }


  //verify otp for password
  async verifyOtp(email: string, otp: string) {
    const user = await UserModel.findOne({
      email,
      passwordResetOTP: otp,
      passwordResetExpires: { $gt: new Date() },
    });
    if (!user) throw new ApiError(400, "Invalid or expired OTP");
    return this.generateOtpToken(String(user._id));
  }


  // update password
  async updatePassword(userId: string, password: string) {
    const user = await UserModel.findById(userId);
    if (!user) throw new ApiError(404, "User not found");
    user.password = password;
    //user.passwordResetToken = undefined;
    await user.save({ validateBeforeSave: false });
  }


  // find a user
  async findUser(loginInfo: string) {
    const user = await UserModel.findOne({
      $or: [{ email: loginInfo.trim() }, { userName: loginInfo.trim() }],
    }).select("userName email fullName");
    if (!user) throw new ApiError(404, "No account found");
    return user;
  }


  // grt expense with dates
async getExpenseOfUserByDates(userId: string, startDate?: string, endDate?: string) {
  let start: Date;
  let end: Date;

  if (!startDate || !endDate) {
    start = new Date();
    start.setDate(1);
    start.setHours(0, 0, 0, 0);

    end = new Date();
    end.setMonth(end.getMonth() + 1);
    end.setDate(0);
    end.setHours(23, 59, 59, 999);
  } else {
    start = new Date(startDate);
    end = new Date(endDate);
  }

  const expenses = await ExpenseModel.aggregate([
    {
      $match: {
        date: { $gte: start, $lte: end },
      },
    },
    {
      $lookup: {
        from: "accounts",
        localField: "account",
        foreignField: "_id",
        as: "accounts",
      },
    },
    { $unwind: "$accounts" },                                   
    {
      $match: {
        "accounts.user": new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $project: {
        _id: 1,
        expenseId: "$_id",
        amount: "$amount",
        desc: "$description",
        date: "$date",
        isGiven: "$isGiven",
        account: "$account",
      },
    },
    { $sort: { date: -1 } },
  ]);

  return expenses;
}


  // change Primary acc
  async changePrimaryAccount(userId: string, accountId: string) {
    const account = await AccountModel.findById(accountId);
    if (!account) throw new ApiError(404, "Account not found");
    this.assertOwnership(String(account.user), userId);

    const user = await UserModel.findById(userId);
    if (!user) throw new ApiError(404, "User not found");
    if (
  String(user.cashAccount) === accountId ||
  String(user.primaryAccount) === accountId
)
      throw new ApiError(400, "Choose a different account");

    user.primaryAccount = account._id;
    await user.save({ validateBeforeSave: false });
  }
}