import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/AsyncHandler";
import { UserModel } from "../Module/User/user.model";
import { DocumentType } from "@typegoose/typegoose";
import { User } from "../Module/User/user.model";
import { db } from "../config/mysqlconfig";

// This gives `req.user` full type safety everywhere in the codebase.
declare global {
  namespace Express {
    interface Request {
      user: DocumentType<User>;
    }
  }
}

// token verify
async function verifyToken(
  token: string,
  secret: string,
): Promise<JwtPayload & { _id: string }> {
  const decoded = jwt.verify(token, secret) as JwtPayload & { _id: string };
  return decoded;
}

// access token cheak
// export const verifyJwtTokenmongo = asyncHandler(
//   async (req: Request, _res: Response, next: NextFunction) => {
//     const secret = process.env.ACCESS_TOKEN_SECRET;
//     if (!secret) throw new ApiError(500, "ACCESS_TOKEN_SECRET not configured");
//     const token =
//       req.cookies?.AccessToken ||
//       req.header("Authorization")?.replace("Bearer ", "").trim();

//     if (!token) throw new ApiError(401, "Unauthorized — no token provided");

//     const decoded = await verifyToken(token, secret);

//     const [user] : any = await 
//     if (!user) throw new ApiError(401, "Invalid access token");
//     req.user = user[0];
//     next();
//   },
// );

export const verifyJwtToken = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const secret = process.env.ACCESS_TOKEN_SECRET;

    if (!secret) {
      throw new ApiError(500, "ACCESS_TOKEN_SECRET not configured");
    }

    const token =
      req.cookies?.AccessToken ||
      req.header("Authorization")?.replace("Bearer ", "").trim();

    if (!token) {
      throw new ApiError(401, "Unauthorized — no token provided");
    }

    const decoded = await verifyToken(token, secret);

    const [rows]: any = await db.execute(
      `
      SELECT
        id,
        userName,
        fullName,
        email,
        created_at
      FROM users
      WHERE id = ?
      `,
      [decoded.id],
    );

    if (rows.length === 0) {
      throw new ApiError(401, "Invalid access token");
    }

    req.user = rows[0];
    next();
  },
);

// otp token cheak
export const verifyOtpJwtToken = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const secret = process.env.OTP_TOKEN_SECRET;
    if (!secret) throw new ApiError(500, "OTP_TOKEN_SECRET not configured");

    const token =
      req.cookies?.OtpToken ||
      req.header("Authorization")?.replace("Bearer ", "").trim();

    if (!token) throw new ApiError(401, "Unauthorized — no OTP token provided");

    const decoded = await verifyToken(token, secret);

    const user = await UserModel.findById(decoded._id).select("_id email");
    if (!user) throw new ApiError(401, "Invalid OTP token");

    req.user = user;
    next();
  },
);
