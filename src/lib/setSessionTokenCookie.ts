import { Response } from "express";

export default function setSessionTokenCookie(
  res: Response,
  token: string,
  expiresAt: Date,
): void {
  res.cookie("sessionToken", token, {
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
  });
}
