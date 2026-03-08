import {User} from "../Models/user.model.js"
import {asyncHandler} from "../utlis/AsyncHandler.js"
import { ApiError } from "../utlis/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
//import { ApiResponse } from "../Backend-in-js/Project/src/utils/ApiResponse.js"

const registerUser = asyncHandler(async (req,res)=>{
    const {userName,fullName,email,password} = req.body
    if(!userName.trim() || !fullName.trim() || !email.trim() || !password.trim()) throw new ApiError(400, "fill all feilds")
    const existUser = await User.findOne(
        {$or: [{email} , {userName}]}
    )
    if(existUser) throw new ApiError(400, "user already exist")
    const user = await User.create({
        userName : userName.toLowerCase(),
        fullName,
        email,
        password
    })
    const createdUser = await User.findById(user._id).select("-password -refreshToken")
    if(!createdUser) throw new ApiError(500, "user did not create")
    return res.status(201).json(new ApiResponse(200 , createdUser, "register successfully"))
})
export {registerUser}