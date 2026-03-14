import { Router } from "express";
import { makeRequest, rejectRequest, delteRequest, getAllRequestRecieved, getAllRequestDone, acceptRequest, getAllFriends, } from "../Controller/friend.controller.js";
import { verifyJwtToken } from "../middleware/Auth.middleware.js";

const router = Router()

router.post("/makeRequest/:requestTo" ,verifyJwtToken ,makeRequest)
router.post("/rejectRequest/:requestId" ,verifyJwtToken ,rejectRequest)
router.post("/delteRequest/:requestTo" ,verifyJwtToken ,delteRequest)
router.get("/getAllRequestRecieved/:requestId" ,verifyJwtToken ,getAllRequestRecieved)
router.get("/getAllRequestDone/:requestTo" ,verifyJwtToken ,getAllRequestDone)
router.post("/acceptRequest/:requestId" ,verifyJwtToken ,acceptRequest)
router.get("/getAllFriends", verifyJwtToken , getAllFriends)
export default router