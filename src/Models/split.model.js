import mongoose from "mongoose";
const splitSchema = mongoose.Schema(
{
    splitFrom:{
        type:mongoose.Types.ObjectId,
        ref:"user",
        required:true
    },
    splitTo:{
        type:mongoose.Types.ObjectId,
        ref:"user",
        required:true
    },
    amount:{
        type:Number,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    
}, 
{ timestamps: true }
);
export const Split = mongoose.model("Split", splitSchema);
