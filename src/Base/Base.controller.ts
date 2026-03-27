import { Request, Response } from "express";
import { ApiResponse } from "../utils/ApiResponse";

export abstract class BaseController {

  protected ok(res: Response, message: string, data?: any) {
    return res.status(200).json( new ApiResponse( 200, message, data));
  }

  protected created(res: Response, message: string, data?: any) {
    return res.status(201).json( new ApiResponse( 201,message));
  }

  protected noContent(res: Response, message: string) {
    return res.status(200).json( new ApiResponse(200, message, undefined));
  }


  protected getUserId(req: Request): string {
    return (req as any).user._id as string;
  }

  // options of cookie config
  protected readonly cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  } as const;
}