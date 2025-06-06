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
import { verifyPasswordHash } from "../lib/password";
import getSession from "../lib/getSession";

const authRouter = express.Router();

/**
 * 사용자 정보를 가져오는 GET 요청
 *
 * 만약 로그인 되어있지 않으면 401 Unauthorized 응답
 */
authRouter.get("/", async (req: Request, res: Response) => {
  const session = await getSession(req);
  if (!session?.user?.id) {
    return void res.status(401).json({ message: "Unauthorized" });
  }
  return void res
    .status(200)
    .json({ message: "Authenticated", user: session.user });
});

/**
 * 회원가입 POST 요청
 */
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

  // 이메일 형식 검증
  if (!verifyEmailInput(email)) {
    return void res.status(400).json({ message: "Invalid email" });
  }

  // 이메일 중복 검사
  const emailAvailable = await checkEmailAvailability(email);
  if (!emailAvailable) {
    return void res.status(409).json({ message: "Email is already used" });
  }

  // 사용자명 검증
  if (!verifyUsernameInput(username)) {
    return void res.status(400).json({ message: "Invalid username" });
  }

  try {
    // 사용자 생성
    const user = await createUser(email, username, password);

    // 세션 생성 & 쿠키 설정
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

/**
 * 로그인 POST 요청
 *
 * 이메일과 비밀번호를 받아서 세션을 생성하고 쿠키에 저장
 */
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

/**
 * 로그아웃 POST 요청
 *
 * 세션 토큰을 무효화하고 쿠키를 삭제
 */
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
