import mongoose from "mongoose";
const expenseScheama = mongoose.Schema({
    desc:{
        type:String,
        required:true,
    },
    amount:{
        type:Number,
        required:true,
    },
    isIncome:{
        type:Boolean,
        required:true,
    },
    date:{
        type:Date,
        required:true,
    },
},
{ timestamps: true });
export default mongoose.model("Expense" , expenseScheama);