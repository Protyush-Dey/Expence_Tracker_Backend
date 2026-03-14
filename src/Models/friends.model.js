import mongoose from "mongoose";
const friendSchema = mongoose.Schema(
  {
    users:[{
        type:mongoose.Types.ObjectId,
        ref:"User"
    }]
  },
  {
    timestamps: true,
  },
);
export const Friend = mongoose.model("Friend", friendSchema);
