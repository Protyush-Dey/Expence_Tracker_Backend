import Expense from "../Models/ExpenseModels.js"
export const addAllExpense =async(req , res)=>{
    try{
        let data = req.body;
        let savedata = await Expense.insertMany(data)
        res.status(200).json(savedata)
    }
    catch(error){
        res.status(500).json({errorMessage:error.message})
    }
    

}