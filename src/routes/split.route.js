import { Router } from "express";
import { verifyJwtToken } from "../middleware/Auth.middleware.js"; 
import { createSingleSplit, createSplit, dueGiveSplit, dueGetSplit } from "../Controller/split.controller.js";
const router = Router()

router.post("/createSingleSplit" , verifyJwtToken , createSingleSplit)
router.post("/createSplit", verifyJwtToken , createSplit)
router.get("/dueGiveSplit/:friendId" , verifyJwtToken , dueGiveSplit)
router.get("/dueGetSplit/:friendId", verifyJwtToken , dueGetSplit)

export default router