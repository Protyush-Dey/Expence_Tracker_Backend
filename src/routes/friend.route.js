import { Router } from "express";
import { makeRequest, rejectRequest, delteRequest, getAllRequestRecieved, getAllRequestDone} from "../Controller/friend.controller.js";
import { verifyJwtToken } from "../middleware/Auth.middleware.js";

const router = Router()

router.post("/makeRequest/:requestTo" ,verifyJwtToken ,makeRequest)
router.post("/rejectRequest/:requestId" ,verifyJwtToken ,rejectRequest)
router.post("/delteRequest/:requestTo" ,verifyJwtToken ,delteRequest)
router.get("/getAllRequestRecieved/:requestId" ,verifyJwtToken ,rejectRequest)
router.get("/getAllRequestDone/:requestTo" ,verifyJwtToken ,delteRequest)
export default router