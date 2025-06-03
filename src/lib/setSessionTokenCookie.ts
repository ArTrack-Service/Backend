import { Response } from "express";

export default function setSessionTokenCookie(
  res: Response,
  token: string,
  expiresAt: Date,
): void {
  res.cookie("sessionToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    expires: expiresAt,
  });
}
