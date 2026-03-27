export class ApiResponse {
  public success: boolean;
  public statusCode: number;
  public message: string;
  public data: any;
  public timestamp: string;

  constructor(statusCode: number, message: string, data?: any) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.success = statusCode < 400;
    this.timestamp = new Date().toISOString();
  }
}