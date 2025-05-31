import express, { Request, Response } from "express";

const auth = express();

auth.post("/sign-up", (req: Request, res: Response) => {
  res.send("Sign-up endpoint");
});

auth.put("/sign-in", (req: Request, res: Response) => {
  res.send("Sign-in endpoint");
});

auth.put("/sign-out", (req: Request, res: Response) => {
  res.send("Sign-out endpoint");
});

export default auth;
