import { User } from "../Models/user.model.js";
import { Account } from "../Models/account.model.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { generateOTP } from "../utils/otp.js";
import { Expense } from "../Models/expences.model.js";
import mongoose from "mongoose";
// import { sendMail } from "../utils/resend.js"; i delete this file but i want this function
//genarate all token
const genarateTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(400, "Something wentwrong");
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(400, error.message || "something went wrong");
  }
};

//genarate Otp token
const genarateOtpTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(400, "Something wentwrong");
    const OtpToken = await user.generateOtpToken();
    user.passwordResetToken = OtpToken;
    user.passwordResetOTP = undefined;
    user.passwordResetExpires = undefined;

    await user.save({ validateBeforeSave: false });

    return OtpToken;
  } catch (error) {
    throw new ApiError(400, error.message || "something went wrong");
  }
};

// register user
const registerUser = asyncHandler(async (req, res) => {
  const { userName, fullName, email, password } = req.body;
  if (!userName.trim() || !fullName.trim() || !email.trim() || !password.trim())
    throw new ApiError(400, "fill all feilds");
  const existUser = await User.findOne({ $or: [{ email }, { userName }] });
  if (existUser) throw new ApiError(400, "user already exist");
  const user = await User.create({
    userName: userName.toLowerCase(),
    fullName,
    email,
    password,
  });
  const cashAccount = await Account.create({
    account: "cash",
    user: user._id,
  });
  const createdUser = await User.findById(user._id);
  if (!createdUser) throw new ApiError(500, "user did not create");
  const createdCashAccount = await Account.findById(cashAccount._id);
  if (!createdCashAccount) throw new ApiError(500, "cash acc. did not create");
  await User.findByIdAndUpdate(
    user._id,
    { cashAccount: createdCashAccount._id },
    { new: true },
  );
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "register successfully"));
});

//login function
const loginUser = asyncHandler(async (req, res) => {
  const { loginInfo, password } = req.body;
  if (!loginInfo.trim() || !password.trim())
    throw new ApiError(400, "Give the feilds");
  const user = await User.findOne({
    $or: [{ email: loginInfo.trim() }, { username: loginInfo.trim() }],
  });
  if (!user) throw new ApiError(400, "can not fint User");
  const isValidPassword = await user.isPasswordCorrect(password);
  if (!isValidPassword) throw new ApiError(400, "incorrect password");
  const { accessToken, refreshToken } = await genarateTokens(user._id);
  const loginData = await User.findById(user._id).select(
    "-password -refreshToken -cashAccount -primaryAccount",
  );
  const options = {
    httpOnly: true,
    secure: false,
  };

  return res
    .status(200)
    .clearCookie("OtpToken")
    .cookie("AccessToken", accessToken, options)
    .cookie("RefreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loginData, accessToken, refreshToken },
        "Logeed in successfully",
      ),
    );
});

//logout user
const logoutUser = asyncHandler(async (req, res) => {
  console.log(req.user._id);

  await User.findByIdAndUpdate(req.user._id, {
    $unset: {
      refreshToken: 1,
    },
  });
  const options = {
    httpOnly: true,
    secure: false,
  };

  return res
    .status(200)
    .clearCookie("AccessToken", options)
    .clearCookie("RefreshToken", options)
    .json(new ApiResponse(200, "Logeed out successfully"));
});

//reset refreshtoken
const resetRefreshToken = asyncHandler(async (req, res) => {
  const incomingRefToken = req.cookies.RefreshToken || req.header.refreshToken;

  if (!incomingRefToken) throw new ApiError(400, "Unauthortized access");
  try {
    const decodedToken = jwt.verify(
      incomingRefToken,
      process.env.REFRESH_TOKEN_SECRET,
    );
    console.log("gdfgd", incomingRefToken);
    const user = await User.findById(decodedToken._id);
    if (!user) throw new ApiError(400, "invalid token");
    if (user?.refreshToken !== incomingRefToken)
      throw new ApiError(400, "refresh token used or expired");
    const { accessToken, refreshToken } = await genarateTokens(user._id);
    const options = {
      httpOnly: true,
      secure: false,
    };

    return res
      .status(200)
      .cookie("AccessToken", accessToken, options)
      .cookie("RefreshToken", refreshToken, options)
      .json(new ApiResponse(200, "token Update successfully"));
  } catch (error) {
    throw new ApiError(400, error.message || "something went wrong");
  }
});

//genrate aand send otp
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email.trim()) throw new ApiError(400, "Give the feilds");
  const user = await User.findOne({ email });
  if (!user) throw new ApiError(400, "account doesnot exist");
  try {
    const otp = generateOTP();
    const passwordResetExpires = Date.now() + 5 * 60 * 1000;
    user.passwordResetOTP = otp;
    user.passwordResetExpires = passwordResetExpires;
    await user.save({ validateBeforeSave: false });
    // const mail = await sendMail(
    //   email,
    //   "OTP to change password",
    //   `Your OTP is ${otp}`,
    // );

    // if (!mail) {
    //   throw new ApiError(500, "Email sending failed");
    // }
    res
      .status(200)
      .json(new ApiResponse(200, `otp genarated but not going ${otp}`));
  } catch (error) {
    throw new ApiError(400, error.message || "somthing went wrong");
  }
});

//genrate aand send otp
const verifyPasswordChangeOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) throw new ApiError(400, "Give the feilds");
  const user = await User.findOne({
    email,
    passwordResetOTP: otp,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) throw new ApiError(400, "Invalid or expired OTP");
  const otpToken = await genarateOtpTokens(user._id);
  const options = {
    httpOnly: true,
    sequre: false,
  };
  return res
    .status(200)
    .cookie("OtpToken", otpToken, options)
    .json(new ApiResponse(200, "otp verified"));
});

//genrate aand send otp
const updatePassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  if (!password.trim()) throw new ApiError(400, "give a password");
  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(400, "user not found");
  user.password = password;
  user.passwordResetToken = undefined;
  await user.save({ validateBeforeSave: false });
  const options = {
    httpOnly: true,
    secure: false,
  };
  return res
    .status(200)
    .clearCookie("OtpToken", options)
    .json(new ApiResponse(200, "password chanched"));
});

// find user to make friends
const findUser = asyncHandler(async (req, res) => {
  const { loginInfo } = req.params;
  if (!loginInfo || !loginInfo.trim())
    throw new ApiError(400, "Give the feilds");
  const user = await User.findOne({
    $or: [{ email: loginInfo.trim() }, { userName: loginInfo.trim() }],
  }).select(" userName email fullName");
  if (!user) throw new ApiError(400, "No account found");
  return res.status(200).json(new ApiResponse(200, user, "account find"));
});
// get this month expenses
const getMonthExpenseOfUser = asyncHandler(async (req, res) => {
  const user = req.user._id;
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const endOfMonth = new Date();
  endOfMonth.setMonth(endOfMonth.getMonth() + 1);
  endOfMonth.setDate(0);
  endOfMonth.setHours(23, 59, 59, 999);
  const expenses = Expense.aggregate([
    {
      $match: {
        date: { $gte: startOfMonth, $lt: endOfMonth },
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
    {
      $unwind: accounts,
    },
    {
      $match: {
        "accounts.user": new mongoose.Types.ObjectId(user),
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
    {
      $sort: { date: -1 },
    },
  ]);
  return res
    .status(200)
    .json(new ApiResponse(200, expenses, "get expenses of this month"));
});
// get Given date expenses
const getExpenseOfUserByDates = asyncHandler(async (req, res) => {
  const user = req.user._id;
  const { startOfMonth, endOfMonth } = req.query;
  if (!startOfMonth || !endOfMonth) throw new ApiError(400, "send the dates");
  const startDate = new Date(startOfMonth);
  const endDate = new Date(endOfMonth);
  const expenses = Expense.aggregate([
    {
      $match: {
        date: { $gte: startDate, $lt: endDate },
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
    {
      $unwind: accounts,
    },
    {
      $match: {
        "accounts.user": new mongoose.Types.ObjectId(user),
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
    {
      $sort: { date: -1 },
    },
  ]);
  return res
    .status(200)
    .json(new ApiResponse(200, expenses, "get expenses of dates"));
});
export {
  registerUser,
  loginUser,
  logoutUser,
  resetRefreshToken,
  forgotPassword,
  verifyPasswordChangeOtp,
  updatePassword,
  findUser,
  getMonthExpenseOfUser,
  getExpenseOfUserByDates,
};
