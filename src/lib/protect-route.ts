import { validateSessionToken } from "../controller/auth.controller";
import { Request, Response } from "express";

export default async function protectRoute(req: Request, res: Response) {
  const token = req.cookies["sessionToken"];
  if (!token) {
    return void res.status(401).json({ message: "Unauthorized" });
  }
  const sessionData = await validateSessionToken(token);
  if (!sessionData.user || !sessionData.session) {
    return void res.status(401).json({ message: "Unauthorized" });
  }

  return sessionData;
}
