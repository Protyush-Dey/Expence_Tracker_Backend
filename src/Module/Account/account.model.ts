import { modelOptions, prop, Ref } from "@typegoose/typegoose";
import { User } from "../User/user.model";
import mongoose from "mongoose";

@modelOptions({
  schemaOptions: {
    timestamps: true,
    collection: "accounts",
  },
})
export class Account {
  @prop({
    required: true,
    type: () => String,
  })
  public account!: string;

  @prop({
    ref: () => User,
    type: () => mongoose.Schema.ObjectId,
  })
  public user?: Ref<User>;
}
