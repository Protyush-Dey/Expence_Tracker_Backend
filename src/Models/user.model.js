import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import "dotenv/config";
const userschema = new Schema(
  {
    userName: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    cashAccount: {
      type: mongoose.Types.ObjectId,
      ref:"Account",
    },
    primaryAccount: {
      type: mongoose.Types.ObjectId,
      ref:"Account"
    },
    password: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
    },
    passwordResetOTP: {
      type: String,
    },
    passwordResetExpires: {
      type: Date,
    },
    passwordResetToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);
userschema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});
userschema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};
userschema.methods.generateAccessToken = async function () {
  const a = jwt.sign(
    {
      _id: this._id,
      fullName: this.fullName,
      email: this.email,
      userName: this.userName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    },
  );

  console.log("a", a);
  return a;
};
userschema.methods.generateRefreshToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    },
  );
};
userschema.methods.generateOtpToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
      email:this.email
    },
    process.env.OTP_TOKEN_SECRET,
    {
      expiresIn: process.env.OTP_TOKEN_EXPIRY,
    },
  );
};
export const User = mongoose.model("User", userschema);
