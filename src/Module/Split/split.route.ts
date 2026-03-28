import { Router } from "express";
import { verifyJwtToken } from "../../middleware/Auth.middleware";
import {splitController} from "./split.controller"

const splitRouter = Router();


splitRouter.post("/createSingleSplit", verifyJwtToken, splitController.createSingleSplit);
splitRouter.post("/createSplit", verifyJwtToken, splitController.createSplit);
splitRouter.get("/dueGiveSplit/:friendId", verifyJwtToken, splitController.dueGiveSplit);
splitRouter.get("/dueGetSplit/:friendId", verifyJwtToken, splitController.dueGetSplit);
splitRouter.delete("/deleteSplit/:splitId", verifyJwtToken, splitController.deleteSplit);
splitRouter.post("/payAllDueDone/:friendId", verifyJwtToken, splitController.payAllDueDone);
splitRouter.post("/payDueDone", verifyJwtToken, splitController.payDueDone);
splitRouter.post("/markAllDueDone/:friendId", verifyJwtToken, splitController.markAllDueDone);
splitRouter.post("/markDueDone", verifyJwtToken, splitController.markDueDone);


export default splitRouter;