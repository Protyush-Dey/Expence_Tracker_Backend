import {
  getModelForClass,
  modelOptions,
  prop,
  Ref,
  pre,
  DocumentType,
} from "@typegoose/typegoose";
import mongoose from "mongoose";

import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import "dotenv/config";
import { Account } from "../Account/account.model";

// 🔥 Pre hook for password hashing
@pre<User>("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
})
@modelOptions({
  schemaOptions: {
    timestamps: true,
    collection: "users",
  },
})
export class User {
  @prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
    type: () => String,
  })
  public userName!: string;

  @prop({
    required: true,
    trim: true,
    index: true,
    type: () => String,
  })
  public fullName!: string;

  @prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    type: () => String,
  })
  public email!: string;

  @prop({
    ref: () => Account,
    type: () => mongoose.Schema.Types.ObjectId,
  })
  public cashAccount?: Ref<any>;

  @prop({
    ref: "Account",
    type: () => mongoose.Schema.Types.ObjectId,
  })
  public primaryAccount?: Ref<Account>;

  @prop({
    required: true,
    type: () => String,
  })
  public password!: string;

  @prop()
  public refreshToken?: string;

  @prop()
  public passwordResetOTP?: string;

  @prop()
  public passwordResetExpires?: Date;

  @prop()
  public passwordResetToken?: string;

  // 🔐 Methods

  public async isPasswordCorrect(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
  }

  public generateAccessToken(this: DocumentType<User>): string {
    const secret = process.env.ACCESS_TOKEN_SECRET;
    const expiry = process.env.ACCESS_TOKEN_EXPIRY;

    if (!secret || !expiry) {
      throw new Error("JWT env variables missing");
    }
    const options: SignOptions = {
      expiresIn: expiry as SignOptions["expiresIn"],
    };
    return jwt.sign(
      {
        _id: this._id,
        fullName: this.fullName,
        email: this.email,
        userName: this.userName,
      },
      secret,
      options,
    );
  }

  public generateRefreshToken(this: DocumentType<User>): string {
    const secret = process.env.REFRESH_TOKEN_SECRET;
    const expiry = process.env.REFRESH_TOKEN_EXPIRY;

    if (!secret || !expiry) {
      throw new Error("JWT env variables missing");
    }
    const options: SignOptions = {
      expiresIn: expiry as SignOptions["expiresIn"],
    };
    return jwt.sign(
      {
        _id: this._id,
      },
      secret,
      options,
    );
  }

  public generateOtpToken(this: DocumentType<User>): string {
    const secret = process.env.OTP_TOKEN_SECRET;
    const expiry = process.env.OTP_TOKEN_EXPIRY;

    if (!secret || !expiry) {
      throw new Error("JWT env variables missing");
    }
    const options: SignOptions = {
      expiresIn: expiry as SignOptions["expiresIn"],
    };
    return jwt.sign(
      {
        _id: this._id,
        email: this.email,
      },
      secret,
      options,
    );
  }
}

// ✅ Model
export const UserModel = getModelForClass(User);
