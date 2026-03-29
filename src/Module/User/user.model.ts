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
import { BaseModel } from "../../Base/Base.model";
import { Account } from "../Account/account.model";

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
export class User extends BaseModel {
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

  @prop({ ref: "Account", type: () => mongoose.Schema.Types.ObjectId })
public cashAccount?: Ref<any>;

@prop({ ref: "Account", type: () => mongoose.Schema.Types.ObjectId })
public primaryAccount?: Ref<any>;

  @prop({ required: true, type: () => String })
  public password!: string;

  @prop({ type: () => String })
  public refreshToken?: string;

  @prop({ type: () => String })
  public passwordResetOTP?: string;

  @prop({ type: () => Date })
  public passwordResetExpires?: Date;


  // functions

  public async isPasswordCorrect(
    this: DocumentType<User>,
    password: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  public generateAccessToken(this: DocumentType<User>): string {
    const secret = process.env.ACCESS_TOKEN_SECRET;
    const expiry = process.env.ACCESS_TOKEN_EXPIRY;
    if (!secret || !expiry) throw new Error("ACCESS_TOKEN env vars missing");

    return jwt.sign(
      {
        _id: this._id,
        fullName: this.fullName,
        email: this.email,
        userName: this.userName,
      },
      secret,
      { expiresIn: expiry as SignOptions["expiresIn"] },
    );
  }

  public generateRefreshToken(this: DocumentType<User>): string {
    const secret = process.env.REFRESH_TOKEN_SECRET;
    const expiry = process.env.REFRESH_TOKEN_EXPIRY;
    if (!secret || !expiry) throw new Error("REFRESH_TOKEN env vars missing");

    return jwt.sign({ _id: this._id }, secret, {
      expiresIn: expiry as SignOptions["expiresIn"],
    });
  }

  public generateOtpToken(this: DocumentType<User>): string {
    const secret = process.env.OTP_TOKEN_SECRET;
    const expiry = process.env.OTP_TOKEN_EXPIRY;
    if (!secret || !expiry) throw new Error("OTP_TOKEN env vars missing");

    return jwt.sign({ _id: this._id, email: this.email }, secret, {
      expiresIn: expiry as SignOptions["expiresIn"],
    });
  }
}

export const UserModel = getModelForClass(User);
