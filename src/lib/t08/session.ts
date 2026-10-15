import type { NextRequest, NextResponse } from "next/server";
import {
  createSession,
  deleteSessionByHash,
  getSessionByHash,
  getUserById,
  type T08User,
} from "./db";
import { randomBase64Url, sha256Hex } from "./encoding";
import { getT08Config } from "./config";

const SESSION_COOKIE = "t08_session";
const SESSION_SECONDS = 60 * 60 * 24 * 7;

export type AuthenticatedSession = {
  tokenHash: string;
  user: T08User;
};

export async function getAuthenticatedSession(
  request: NextRequest,
): Promise<AuthenticatedSession | null> {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const tokenHash = sha256Hex(token);
  const session = await getSessionByHash(tokenHash);
  if (!session) return null;

  if (new Date(session.expires_at).getTime() <= Date.now()) {
    await deleteSessionByHash(tokenHash);
    return null;
  }

  const user = await getUserById(session.user_id);
  if (!user) {
    await deleteSessionByHash(tokenHash);
    return null;
  }

  return { tokenHash, user };
}

export async function issueSession(
  response: NextResponse,
  userId: string,
): Promise<void> {
  const token = randomBase64Url(32);
  const tokenHash = sha256Hex(token);
  const expiresAt = new Date(Date.now() + SESSION_SECONDS * 1000);

  await createSession({
    tokenHash,
    userId,
    expiresAt: expiresAt.toISOString(),
  });

  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: getT08Config().origin.startsWith("https://"),
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
}

export async function revokeSession(
  request: NextRequest,
  response: NextResponse,
): Promise<void> {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (token) {
    await deleteSessionByHash(sha256Hex(token));
  }

  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: getT08Config().origin.startsWith("https://"),
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export function assertSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  return origin === getT08Config().origin;
}
