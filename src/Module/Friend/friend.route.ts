import { Router } from "express";
import { verifyJwtToken } from "../../middleware/Auth.middleware";
import { friendController } from "./friend.controller";


const friendRouter = Router();


friendRouter.post("/makeRequest/:requestTo" ,verifyJwtToken , friendController.makeRequest)
friendRouter.delete("/rejectRequest/:requestId" ,verifyJwtToken ,friendController.rejectRequest)
friendRouter.delete("/deleteRequest/:requestId" ,verifyJwtToken ,friendController.delteRequest)
friendRouter.get("/getAllRequestRecieved/:requestId" ,verifyJwtToken ,friendController.getAllRequestRecieved)
friendRouter.get("/getAllRequestDone/:requestTo" ,verifyJwtToken ,friendController.getAllRequestDone)
friendRouter.post("/acceptRequest/:requestId" ,verifyJwtToken ,friendController.acceptRequest)
friendRouter.get("/getAllFriends", verifyJwtToken , friendController.getAllFriends)


export default friendRouter;