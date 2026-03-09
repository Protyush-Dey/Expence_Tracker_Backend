import mongoose, { Schema } from "mongoose";
import { User } from "./user.model.js";
const accountSchema = mongoose.Schema({
  account: {
    type: String,
    required: true,
  },
  user:{
    type:Schema.Types.ObjectId,
    ref:"User"
  }
},
{
    timestamp:true
});

export const Account = mongoose.model("Account", accountSchema);
