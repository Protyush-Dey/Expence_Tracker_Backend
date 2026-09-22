import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import { ApiError } from "../../utils/ApiError";
import { generateOTP } from "../../utils/otp";
import { prisma } from "../../config/prisma";

export class UserService {
  // ─── Token Helpers ────────────────────────────────────────────────────────

  private generateAccessToken(user: {
    id: string;
    email: string;
    userName: string;
    fullName: string;
  }): string {
    const secret = process.env.ACCESS_TOKEN_SECRET;
    const expiry = process.env.ACCESS_TOKEN_EXPIRY;
    if (!secret || !expiry) throw new Error("ACCESS_TOKEN env vars missing");

    return jwt.sign(
      {
        id: user.id,
        _id: user.id,
        fullName: user.fullName,
        email: user.email,
        userName: user.userName,
      },
      secret,
      { expiresIn: expiry as SignOptions["expiresIn"] }
    );
  }

  private generateRefreshToken(userId: string): string {
    const secret = process.env.REFRESH_TOKEN_SECRET;
    const expiry = process.env.REFRESH_TOKEN_EXPIRY;
    if (!secret || !expiry) throw new Error("REFRESH_TOKEN env vars missing");

    return jwt.sign(
      { id: userId, _id: userId },
      secret,
      { expiresIn: expiry as SignOptions["expiresIn"] }
    );
  }

  async generateTokens(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new ApiError(404, "User not found");

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user.id);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return { accessToken, refreshToken };
  }

  private generateOtpToken(userId: string, email: string): string {
    const secret = process.env.OTP_TOKEN_SECRET;
    const expiry = process.env.OTP_TOKEN_EXPIRY;
    if (!secret || !expiry) throw new Error("OTP_TOKEN env vars missing");

    return jwt.sign(
      { id: userId, _id: userId, email },
      secret,
      { expiresIn: expiry as SignOptions["expiresIn"] }
    );
  }

  // register the user
  async registerUser(data: {
    userName: string;
    fullName: string;
    email: string;
    password: string;
  }) {
    const { userName, fullName, email, password } = data;

    const exists = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { userName: userName.toLowerCase() },
        ],
      },
    });
    if (exists) throw new ApiError(409, "User already exists");

    const hashedPassword = await bcrypt.hash(password, 10);

    const createdUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          userName: userName.toLowerCase(),
          fullName,
          email: email.toLowerCase(),
          password: hashedPassword,
        },
      });

      const cashAccount = await tx.account.create({
        data: {
          account: "cash",
          userId: user.id,
        },
      });

      const updated = await tx.user.update({
        where: { id: user.id },
        data: {
          cashAccountId: cashAccount.id,
        },
        select: {
          id: true,
          userName: true,
          fullName: true,
          email: true,
          cashAccountId: true,
          primaryAccountId: true,
          createdAt: true,
        },
      });

      return {
        ...updated,
        _id: updated.id,
      };
    });

    if (!createdUser) throw new ApiError(500, "User creation failed");
    return createdUser;
  }

  // login the user
  async loginUser(loginInfo: string, password: string) {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: loginInfo.trim().toLowerCase() },
          { userName: loginInfo.trim().toLowerCase() },
        ],
      },
    });
    if (!user) throw new ApiError(404, "User not found");

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new ApiError(401, "Incorrect password");

    const { accessToken, refreshToken } = await this.generateTokens(user.id);

    const loginData = {
      id: user.id,
      _id: user.id,
      userName: user.userName,
      fullName: user.fullName,
      email: user.email,
    };

    return { loginData, accessToken, refreshToken };
  }

  // logout the user
  async logoutUser(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }

  // me
  async me(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        userName: true,
        email: true,
      },
    });
    if (!user) throw new ApiError(404, "user not found");
    return {
      ...user,
      _id: user.id,
    };
  }

  // reset refresh token
  async resetRefreshToken(incomingRefToken: string) {
    const secret = process.env.REFRESH_TOKEN_SECRET;
    if (!secret) throw new ApiError(500, "REFRESH_TOKEN_SECRET not configured");

    const decoded = jwt.verify(incomingRefToken, secret) as {
      id?: string;
      _id?: string;
    };
    const userId = decoded.id || decoded._id;
    if (!userId) throw new ApiError(401, "Invalid token");

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new ApiError(401, "Invalid token");
    if (user.refreshToken !== incomingRefToken)
      throw new ApiError(401, "Refresh token expired or already used");

    return this.generateTokens(user.id);
  }

  // forgot password
  async initForgotPassword(email: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (!user) throw new ApiError(404, "Account does not exist");

    const otp = generateOTP();
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetOTP: otp,
        passwordResetExpires: new Date(Date.now() + 5 * 60 * 1000),
      },
    });

    return otp;
  }

  // verify otp for password
  async verifyOtp(email: string, otp: string) {
    const user = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        passwordResetOTP: otp,
        passwordResetExpires: {
          gt: new Date(),
        },
      },
    });
    if (!user) throw new ApiError(400, "Invalid or expired OTP");

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetOTP: null,
        passwordResetExpires: null,
      },
    });

    return this.generateOtpToken(user.id, user.email);
  }

  // update password
  async updatePassword(userId: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new ApiError(404, "User not found");

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        passwordResetOTP: null,
        passwordResetExpires: null,
      },
    });
  }

  // find a user
  async findUser(loginInfo: string) {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: loginInfo.trim().toLowerCase() },
          { userName: loginInfo.trim().toLowerCase() },
        ],
      },
      select: {
        id: true,
        userName: true,
        email: true,
        fullName: true,
      },
    });
    if (!user) throw new ApiError(404, "No account found");
    return {
      ...user,
      _id: user.id,
    };
  }

  // get expense with dates
  async getExpenseOfUserByDates(
    userId: string,
    startDate?: string,
    endDate?: string
  ) {
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

    const expenses = await prisma.expense.findMany({
      where: {
        userId,
        date: {
          gte: start,
          lte: end,
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    return expenses.map((e) => ({
      _id: e.id,
      id: e.id,
      expenseId: e.id,
      amount: e.amount,
      desc: e.description,
      date: e.date,
      isGiven: e.isGiven,
      account: e.accountId,
      category: e.category.toLowerCase(),
    }));
  }

  // change Primary acc
  async changePrimaryAccount(userId: string, accountId: string) {
    const account = await prisma.account.findUnique({
      where: { id: accountId },
    });
    if (!account) throw new ApiError(404, "Account not found");
    if (account.userId !== userId) throw new ApiError(403, "Access denied");

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new ApiError(404, "User not found");

    if (
      user.cashAccountId === accountId ||
      user.primaryAccountId === accountId
    ) {
      throw new ApiError(400, "Choose a different account");
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        primaryAccountId: account.id,
      },
    });
  }
}