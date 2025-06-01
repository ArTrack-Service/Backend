import { hashPassword } from "./password";
import db from "../db";
import { userTable } from "../db/schema";

export function verifyUsernameInput(username: string): boolean {
  return (
    username.length > 3 && username.length < 32 && username.trim() === username
  );
}

export async function createUser(
  email: string,
  username: string,
  password: string,
): Promise<User> {
  const passwordHash = await hashPassword(password);
  const createUser = await db
    .insert(userTable)
    .values({
      email: email,
      username: username,
      password: passwordHash,
    })
    .returning();
  if (createUser === null) {
    throw new Error("Unexpected error");
  }
  return {
    id: createUser[0].id,
    username,
    email,
  };
}

export interface User {
  id: string;
  email: string;
  username: string;
}
