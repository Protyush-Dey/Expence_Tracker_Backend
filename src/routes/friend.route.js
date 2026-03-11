import { Router } from "express";
import { makeRequest } from "../Controller/friend.controller.js";
import { verifyJwtToken } from "../middleware/Auth.middleware.js";

const router = Router()

router.post("/makeRequest/:requestTo" ,verifyJwtToken ,makeRequest)
export default router