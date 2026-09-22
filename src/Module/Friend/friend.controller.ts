import { Request, Response } from "express";
import { asyncHandler } from "../../utils/AsyncHandler";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { BaseController } from "../../Base/Base.controller";
import { FriendService } from "./friend.service";

const friendService = new FriendService();

class FriendController extends BaseController {
  // make request
  makeRequest = asyncHandler(async (req: Request, res: Response) => {
    const { requestTo } = req.params;
    if (!requestTo) throw new ApiError(400, "Give a account id");

    await friendService.makeRequest(this.getUserId(req), requestTo.toString());
    return res.status(200).json(new ApiResponse(200, "Request created"));
  });

  // reject request
  rejectRequest = asyncHandler(async (req: Request, res: Response) => {
    const { requestId } = req.params;
    if (!requestId) throw new ApiError(400, "Give the information");

    await friendService.rejectRequest(this.getUserId(req), requestId.toString());
    return res.status(200).json(new ApiResponse(200, "Request rejected"));
  });

  // delete request
  delteRequest = asyncHandler(async (req: Request, res: Response) => {
    const { requestId } = req.params;
    if (!requestId) throw new ApiError(400, "Give the information");

    await friendService.deleteRequest(this.getUserId(req), requestId.toString());
    return res.status(200).json(new ApiResponse(200, "Request deleted"));
  });

  // get all friend Received request
  getAllRequestRecieved = asyncHandler(async (req: Request, res: Response) => {
    const requests = await friendService.getAllRequestsReceived(this.getUserId(req));
    return res
      .status(200)
      .json(new ApiResponse(200, "Get all request received", requests ?? []));
  });

  // get all friend sent request
  getAllRequestDone = asyncHandler(async (req: Request, res: Response) => {
    const requests = await friendService.getAllRequestsSent(this.getUserId(req));
    return res
      .status(200)
      .json(new ApiResponse(200, "Get all request done", requests ?? []));
  });

  // accept request
  acceptRequest = asyncHandler(async (req: Request, res: Response) => {
    const { requestId } = req.params;
    if (!requestId) throw new ApiError(400, "Give the request id");

    await friendService.acceptRequest(this.getUserId(req), requestId.toString());
    return res.status(200).json(new ApiResponse(200, "Make them friend"));
  });

  // all friend list
  getAllFriends = asyncHandler(async (req: Request, res: Response) => {
    const friends = await friendService.getAllFriends(this.getUserId(req));
    return res
      .status(200)
      .json(new ApiResponse(200, "Get all friend list", friends));
  });
}

export const friendController = new FriendController();
