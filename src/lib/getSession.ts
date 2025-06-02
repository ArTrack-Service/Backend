import { validateSessionToken } from "../controller/auth.controller";
import { Request, Response } from "express";

export default async function getSession(req: Request) {
  const token = req.cookies["sessionToken"];
  return await validateSessionToken(token);
}
