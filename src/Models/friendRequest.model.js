import mongoose, { Schema } from "mongoose";
const friendRequestSchema = mongoose.Schema(
  {
    requestTo:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    requestFrom:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    }
  },
  {
    timestamps: true,
  },
);
export const FriendRequest = mongoose.model("FriendRequest", friendRequestSchema);
