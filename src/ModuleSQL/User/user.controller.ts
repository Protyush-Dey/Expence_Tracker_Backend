import { Request, Response, CookieOptions } from "express";
import { asyncHandler } from "../../utils/AsyncHandler";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { UserService } from "./user.service";

const userService = new UserService();

class UserController {
  // register the user
  registerUser = asyncHandler(async (req: Request, res: Response) => {
    const { userName, fullName, email, password } = req.body as Record<
      string,
      string
    >;
    if (
      !userName?.trim() ||
      !fullName?.trim() ||
      !email?.trim() ||
      !password?.trim()
    )
      throw new ApiError(400, "All fields are required");

    const user = await userService.registerUser({
      userName,
      fullName,
      email,
      password,
    });
    return res.json(new ApiResponse(200, "Account created succesfully"));
  });

  // login the user
  loginUser = asyncHandler(async (req: Request, res: Response) => {
    const { loginInfo, password } = req.body as {
      loginInfo: string;
      password: string;
    };
    if (!loginInfo?.trim() || !password?.trim())
      throw new ApiError(400, "All fields are required");

    const { loginData, accessToken, refreshToken } =
      await userService.loginUser(loginInfo, password);

    const cookieOptions: CookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };

    return res
      .status(200)
      .clearCookie("OtpToken")
      .cookie("AccessToken", accessToken, cookieOptions)
      .cookie("RefreshToken", refreshToken, cookieOptions)
      .json(new ApiResponse(200, "Logged in successfully"));
  });

  //me
  me = asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.me(req.user.id);
    return res
      .status(200)
      .json(new ApiResponse(200, "Data get successfully", user));
  });

  // //logout user
  logoutUser = asyncHandler(async (req: Request, res: Response) => {
    await userService.logoutUser(req.user.id);
    const cookieOptions: CookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };
    return res
      .status(200)
      .clearCookie("AccessToken", cookieOptions)
      .clearCookie("RefreshToken", cookieOptions)
      .json(new ApiResponse(200, "Logged out successfully"));
  });

  // // reset refresh token
  // resetRefreshToken = asyncHandler(async (req: Request, res: Response) => {
  //   const incomingRefToken =
  //     req.cookies?.RefreshToken ||
  //     (req.headers["refreshtoken"] as string | undefined);
  //   if (!incomingRefToken) throw new ApiError(401, "Unauthorized access");

  //   const { accessToken, refreshToken } =
  //     await userService.resetRefreshToken(incomingRefToken);

  //   return res
  //     .status(200)
  //     .cookie("AccessToken", accessToken, this.cookieOptions)
  //     .cookie("RefreshToken", refreshToken, this.cookieOptions)
  //     .json(new ApiResponse(200, "Token updated successfully"));
  // });

  // //forgot password
  // forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  //   const { email } = req.body as { email: string };
  //   if (!email?.trim()) throw new ApiError(400, "Give the fields");

  //   const otp = await userService.initForgotPassword(email);
  //   return res.status(200).json(new ApiResponse(200, "OTP generated", { otp }));
  // });

  // //verify otp for password
  // verifyPasswordChangeOtp = asyncHandler(
  //   async (req: Request, res: Response) => {
  //     const { email, otp } = req.body as { email: string; otp: string };
  //     if (!email || !otp) throw new ApiError(400, "Give the fields");

  //     const otpToken = await userService.verifyOtp(email, otp);
  //     return res
  //       .status(200)
  //       .cookie("OtpToken", otpToken, this.cookieOptions)
  //       .json(new ApiResponse(200, "OTP verified"));
  //   },
  // );

  // // update password
  // updatePassword = asyncHandler(async (req: Request, res: Response) => {
  //   const { password } = req.body as { password: string };
  //   if (!password?.trim()) throw new ApiError(400, "Give a password");

  //   await userService.updatePassword(this.getUserId(req), password);
  //   return res
  //     .status(200)
  //     .clearCookie("OtpToken", this.cookieOptions)
  //     .json(new ApiResponse(200, "Password changed"));
  // });

  // // find a friend
  // findUser = asyncHandler(async (req: Request, res: Response) => {
  //   const { loginInfo } = req.params;
  //   if (!loginInfo?.toString().trim())
  //     throw new ApiError(400, "Give the fields");

  //   const user = await userService.findUser(loginInfo.toString());
  //   return res.status(200).json(new ApiResponse(200, "Account found", user));
  // });

  // // get expense with the same month
  // getMonthExpenseOfUser = asyncHandler(async (req: Request, res: Response) => {
  //   const expenses = await userService.getExpenseOfUserByDates(
  //     this.getUserId(req),
  //   );
  //   return res
  //     .status(200)
  //     .json(new ApiResponse(200, "Get expenses of this month", expenses));
  // });

  // // get expense with the given date
  // getExpenseOfUserByDates = asyncHandler(
  //   async (req: Request, res: Response) => {
  //     const { startOfMonth, endOfMonth } = req.query as {
  //       startOfMonth?: string;
  //       endOfMonth?: string;
  //     };
  //     if (!startOfMonth || !endOfMonth)
  //       throw new ApiError(400, "Send the dates");

  //     const expenses = await userService.getExpenseOfUserByDates(
  //       this.getUserId(req),
  //       startOfMonth,
  //       endOfMonth,
  //     );
  //     return res
  //       .status(200)
  //       .json(new ApiResponse(200, "Get expenses of dates", expenses));
  //   },
  // );

  // // change primary account
  // changePrimaryAccount = asyncHandler(async (req: Request, res: Response) => {
  //   const { accountId } = req.params;
  //   await userService.changePrimaryAccount(
  //     this.getUserId(req),
  //     accountId.toString(),
  //   );
  //   return res
  //     .status(200)
  //     .json(new ApiResponse(200, "Primary account changed"));
  // });
}

export const userController = new UserController();
