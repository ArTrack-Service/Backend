import { eq, InferSelectModel } from "drizzle-orm";
import { sessionTable, userTable } from "../db/schema";
import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";
import db from "../db";
import crypto from "crypto";

/**
 * 사용자 정보 타입
 */
export type User = InferSelectModel<typeof userTable>;
/**
 * 세션 정보 타입
 */
export type Session = InferSelectModel<typeof sessionTable>;

/**
 * 세션 생성 함수
 * @returns {string} 생성된 세션 토큰
 */
export function generateSessionToken(): string {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  return encodeBase32LowerCaseNoPadding(bytes);
}

/**
 * 세션 생성 함수
 *
 * 세션 생성 후 DB에 저장하고 세션 정보를 반환
 * @param token - 세션 토큰
 * @param userId - 사용자 ID
 */
export async function createSession(
  token: string,
  userId: string,
): Promise<Session> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const session: Session = {
    id: sessionId,
    userId,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
  };
  await db.insert(sessionTable).values(session);
  return session;
}

/**
 * 세션 토큰을 검증하는 함수
 *
 * 세션 토큰을 검증한 다음 사용자 정보와 세션 정보를 반환
 * @param token - 세션 토큰
 */
export async function validateSessionToken(
  token: string,
): Promise<SessionValidationResult> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const result = await db
    .select({ user: userTable, session: sessionTable })
    .from(sessionTable)
    .innerJoin(userTable, eq(sessionTable.userId, userTable.id))
    .where(eq(sessionTable.id, sessionId));
  if (result.length < 1) {
    return { session: null, user: null };
  }
  const { user, session } = result[0];
  if (Date.now() >= session.expiresAt.getTime()) {
    await db.delete(sessionTable).where(eq(sessionTable.id, session.id));
    return { session: null, user: null };
  }
  if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
    session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
    await db
      .update(sessionTable)
      .set({
        expiresAt: session.expiresAt,
      })
      .where(eq(sessionTable.id, session.id));
  }
  return { session, user };
}

/**
 * 세션을 무효화하는 함수
 *
 * DB에서 세션을 삭제하여 무효화
 * @param sessionId - 세션 ID
 */
export async function invalidateSession(sessionId: string): Promise<void> {
  await db.delete(sessionTable).where(eq(sessionTable.id, sessionId));
}

/**
 * 사용자의 모든 세션을 무효화하는 함수
 * @param userId - 사용자 ID
 */
export async function invalidateAllSessions(userId: string): Promise<void> {
  await db.delete(sessionTable).where(eq(sessionTable.userId, userId));
}

export type SessionValidationResult =
  | { session: Session; user: User }
  | { session: null; user: null };
