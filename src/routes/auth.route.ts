import express, { Request, Response } from "express";

import {
  createSession,
  generateSessionToken,
  invalidateSession,
} from "../controller/auth.controller";
import { checkEmailAvailability, verifyEmailInput } from "../lib/email";
import { createUser, verifyUsernameInput } from "../lib/user";
import db from "../db";
import { eq } from "drizzle-orm";
import { userTable } from "../db/schema";
import setSessionTokenCookie from "../lib/setSessionTokenCookie";
import { verify } from "@node-rs/argon2";
import { verifyPasswordHash } from "../lib/password";

const authRouter = express.Router();

authRouter.post("/sign-up", async (req: Request, res: Response) => {
  const { email, username, password } = req.body as {
    email?: unknown;
    username?: unknown;
    password?: unknown;
  };

  if (
    typeof email !== "string" ||
    typeof username !== "string" ||
    typeof password !== "string"
  ) {
    return void res.status(400).json({ message: "Invalid or missing fields" });
  }
  if (email === "" || username === "" || password === "") {
    return void res
      .status(400)
      .json({ message: "Please enter your username, email, and password" });
  }

  // 4) 이메일 형식 검증
  if (!verifyEmailInput(email)) {
    return void res.status(400).json({ message: "Invalid email" });
  }

  // 5) 이메일 중복 검사
  const emailAvailable = await checkEmailAvailability(email);
  if (!emailAvailable) {
    return void res.status(409).json({ message: "Email is already used" });
  }

  // 6) 사용자명 검증
  if (!verifyUsernameInput(username)) {
    return void res.status(400).json({ message: "Invalid username" });
  }

  try {
    // 9) 사용자 생성
    const user = await createUser(email, username, password);

    // 12) 세션 생성 & 쿠키 설정
    const sessionToken = generateSessionToken();
    const session = await createSession(sessionToken, user.id);
    res.cookie("sessionToken", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      expires: session.expiresAt,
    });

    return void res.status(200).json({ message: "Sign-up successful" });
  } catch (err) {
    console.error(err);
    return void res.status(500).json({ message: "Sign-up error" });
  }
});

authRouter.post("/sign-in", async (req: Request, res: Response) => {
  const { email, password } = req.body as {
    email?: unknown;
    password?: unknown;
  };
  if (typeof email !== "string" || typeof password !== "string") {
    return void res.status(400).json({ message: "Invalid or missing fields" });
  }
  const user = await db.query.userTable.findFirst({
    where: eq(userTable.email, email),
  });
  if (!user) {
    return void res.status(404).json({ message: "User not found" });
  }

  if (!(await verifyPasswordHash(user.password, password))) {
    return void res.status(401).json({ message: "Invalid password" });
  }

  const token = generateSessionToken();
  const session = await createSession(token, user.id);
  setSessionTokenCookie(res, token, session.expiresAt);

  res.status(200).json({ message: "Sign-in successful" });
  return;
});

authRouter.post("/sign-out", async (req: Request, res: Response) => {
  const token = req.cookies["sessionToken"];
  console.log(req.cookies);
  if (!token) {
    return void res.status(400).json({ message: "No session token found" });
  }

  await invalidateSession(token.id);

  res.clearCookie("sessionToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
  });

  return void res.status(200).json({ message: "Sign-out successful" });
});

export default authRouter;
