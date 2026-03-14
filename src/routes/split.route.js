import { Router } from "express";
import { verifyJwtToken } from "../middleware/Auth.middleware.js";
import {
  createSingleSplit,
  createSplit,
  dueGiveSplit,
  dueGetSplit,
  deleteSplit,
  payAllDueDone,
  payDueDone,
  markAllDueDone,
  markDueDone,
} from "../Controller/split.controller.js";
const router = Router();

router.post("/createSingleSplit", verifyJwtToken, createSingleSplit);
router.post("/createSplit", verifyJwtToken, createSplit);
router.get("/dueGiveSplit/:friendId", verifyJwtToken, dueGiveSplit);
router.get("/dueGetSplit/:friendId", verifyJwtToken, dueGetSplit);
router.delete("/deleteSplit/:splitId", verifyJwtToken, deleteSplit);
router.post("/payAllDueDone/:friendId", verifyJwtToken, payAllDueDone);
router.post("/payDueDone", verifyJwtToken, payDueDone);
router.post("/markAllDueDone/:friendId", verifyJwtToken, markAllDueDone);
router.post("/markDueDone", verifyJwtToken, markDueDone);
export default router;
