import { Response } from "express";
class ApiResponse {
  static success(
    res: Response,
    message: String,
    data?: any,
    statusCode: number = 200,
  ) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  static error(
    res: Response,
    message: String,
    StatusCode: number = 500,
    error?: any,
  ) {
    return res.status(StatusCode).json({
      success: false,
      message,
      error: error,
      timestamp: new Date().toISOString(),
    });
  }
}
