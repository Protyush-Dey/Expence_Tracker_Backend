import { Request, Response } from "express";
import { asyncHandler } from "../../utils/AsyncHandler";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { BaseController } from "../../Base/Base.controller";
import { SplitService } from "./split.service";

const splitService = new SplitService();

class SplitController extends BaseController {


  //create split to one friend 
  createSingleSplit = asyncHandler(async (req: Request, res: Response) => {
    const { splitTo, amount, description } = req.body as {
      splitTo: string;
      amount: number;
      description: string;
    };
    if (!description?.trim() || !amount || !splitTo)
      throw new ApiError(400, "Give all fields");

    const split = await splitService.createSingleSplit({
      splitFrom: this.getUserId(req),
      splitTo,
      amount,
      description,
    });
    return res.status(200).json(new ApiResponse(200, "Split made successfully", split));
  });

  // make a group split
  createSplit = asyncHandler(async (req: Request, res: Response) => {
    const { details, description } = req.body as {
      details: Array<{ splitTo: string; amount: number }>;
      description: string;
    };
    if (!description?.trim() || !details?.length)
      throw new ApiError(400, "Give all fields");

    await splitService.createBulkSplits(this.getUserId(req), description, details);
    return res.status(200).json(new ApiResponse(200, "Split made successfully"));
  });


    // gat all splits to pay
  dueGiveSplit = asyncHandler(async (req: Request, res: Response) => {
    const { friendId } = req.params;
    if (!friendId) throw new ApiError(400, "Give the friend id");

    const splits = await splitService.getDueToGive(this.getUserId(req), friendId.toString());
    return res.status(200).json(new ApiResponse(200, "Get all due split to give", splits));
  });


    // gat all splits tobe paid
  dueGetSplit = asyncHandler(async (req: Request, res: Response) => {
    const { friendId } = req.params;
    if (!friendId) throw new ApiError(400, "Give the friend id");

    const splits = await splitService.getDueToGet(this.getUserId(req), friendId.toString());
    return res.status(200).json(new ApiResponse(200, "Get all due split to give", splits));
  });


    // detlete split from split from
  deleteSplit = asyncHandler(async (req: Request, res: Response) => {
    const { splitId } = req.params;
    if (!splitId) throw new ApiError(400, "Give the SplitId");

    await splitService.deleteSplit(this.getUserId(req), splitId.toString());
    return res.status(200).json(new ApiResponse(200, "Split deleted"));
  });



    // pay all due
  payAllDueDone = asyncHandler(async (req: Request, res: Response) => {
    const { friendId } = req.params;
    if (!friendId) throw new ApiError(400, "Give the friendId");

    await splitService.payAllDue(this.getUserId(req), friendId.toString());
    return res.status(200).json(new ApiResponse(200, "Mark one due done"));
  });



    // pay all due
  payDueDone = asyncHandler(async (req: Request, res: Response) => {
    const { splitId } = req.body as { splitId: string };
    if (!splitId) throw new ApiError(400, "Give the splitid");

    await splitService.payOneDue(this.getUserId(req), splitId);
    return res.status(200).json(new ApiResponse(200, "Mark one due done"));
  });



    //mark pay all due
  markAllDueDone = asyncHandler(async (req: Request, res: Response) => {
    const { friendId } = req.params;
    if (!friendId) throw new ApiError(400, "Give the friendId");

    await splitService.markAllDueDone(this.getUserId(req), friendId.toString());
    return res.status(200).json(new ApiResponse(200, "Mark one due done"));
  });



  //mark pay one
  markDueDone = asyncHandler(async (req: Request, res: Response) => {
    const { splitId } = req.body as { splitId: string };
    if (!splitId) throw new ApiError(400, "Give the splitid");

    await splitService.markOneDueDone(this.getUserId(req), splitId);
    return res.status(200).json(new ApiResponse(200, "Mark one due done"));
  });
}

export const splitController = new SplitController();