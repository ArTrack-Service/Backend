import db from "../db";
import { eq } from "drizzle-orm";
import { userTable } from "../db/schema";

export function verifyEmailInput(email: string): boolean {
  return /^.+@.+\..+$/.test(email) && email.length < 256;
}

export async function checkEmailAvailability(email: string): Promise<boolean> {
  const row = await db.query.userTable.findFirst({
    where: eq(userTable.email, email),
  });
  return !row;
}
