import dotenv from "dotenv";

dotenv.config();

interface Config {
  databaseUrl: string;
  port: number;
  corsOrigin: string;
  accessTokenSecret: string;
  accessTokenExpiry: string;
  refreshTokenSecret: string;
  refreshTokenExpiry: string;
  otpTokenSecret: string;
  otpTokenExpiry: string;
}

export const config: Config = {
  databaseUrl: process.env.DATABASE_URL || "",
  port: Number(process.env.PORT) || 4000,
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET || "DEFAULT_ACCESS_SECRET",
  accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY || "1d",
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || "DEFAULT_REFRESH_SECRET",
  refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || "10d",
  otpTokenSecret: process.env.OTP_TOKEN_SECRET || "DEFAULT_OTP_SECRET",
  otpTokenExpiry: process.env.OTP_TOKEN_EXPIRY || "5m",
};

console.log(
  "==> DATABASE_URL:",
  config.databaseUrl ? "Found \u2705" : "Missing \u274c"
);