import { Router } from "express";
import { verifyJwtToken } from "../middleware/Auth.middleware.js"; 
import { createSingleSplit, createSplit, dueGiveSplit, dueGetSplit, deleteSplit } from "../Controller/split.controller.js";
const router = Router()

router.post("/createSingleSplit" , verifyJwtToken , createSingleSplit)
router.post("/createSplit", verifyJwtToken , createSplit)
router.get("/dueGiveSplit/:friendId" , verifyJwtToken , dueGiveSplit)
router.get("/dueGetSplit/:friendId", verifyJwtToken , dueGetSplit)
router.delete("/deleteSplit/:splitId", verifyJwtToken , deleteSplit)
export default router