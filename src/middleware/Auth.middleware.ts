import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/AsyncHandler";
import { prisma } from "../config/prisma";

export interface AuthUser {
  id: string;
  _id?: string;
  userName: string;
  fullName: string;
  email: string;
  createdAt?: Date;
  cashAccountId?: string | null;
  primaryAccountId?: string | null;
}

declare global {
  namespace Express {
    interface Request {
      user: AuthUser;
    }
  }
}

// token verify
async function verifyToken(
  token: string,
  secret: string
): Promise<JwtPayload & { id?: string; _id?: string }> {
  const decoded = jwt.verify(token, secret) as JwtPayload & { id?: string; _id?: string };
  return decoded;
}

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
    const userId = decoded.id || decoded._id;

    if (!userId) {
      throw new ApiError(401, "Invalid access token payload");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        userName: true,
        fullName: true,
        email: true,
        createdAt: true,
        cashAccountId: true,
        primaryAccountId: true,
      },
    });

    if (!user) {
      throw new ApiError(401, "Invalid access token");
    }

    req.user = {
      ...user,
      _id: user.id,
    };
    next();
  }
);

// otp token check
export const verifyOtpJwtToken = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const secret = process.env.OTP_TOKEN_SECRET;
    if (!secret) throw new ApiError(500, "OTP_TOKEN_SECRET not configured");

    const token =
      req.cookies?.OtpToken ||
      req.header("Authorization")?.replace("Bearer ", "").trim();

    if (!token) throw new ApiError(401, "Unauthorized — no OTP token provided");

    const decoded = await verifyToken(token, secret);
    const userId = decoded.id || decoded._id;

    if (!userId) {
      throw new ApiError(401, "Invalid OTP token payload");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, userName: true, fullName: true },
    });

    if (!user) throw new ApiError(401, "Invalid OTP token");

    req.user = {
      ...user,
      _id: user.id,
    };
    next();
  }
);
