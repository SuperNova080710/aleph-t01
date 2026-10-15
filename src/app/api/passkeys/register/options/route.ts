import { NextRequest, NextResponse } from "next/server";
import { getT08Config } from "@/lib/t08/config";
import {
  createChallenge,
  getPasskeysByUserId,
  getUserByUsername,
} from "@/lib/t08/db";
import { randomBase64Url } from "@/lib/t08/encoding";
import {
  assertSameOrigin,
  getAuthenticatedSession,
} from "@/lib/t08/session";
import {
  normalizeDisplayName,
  normalizeUsername,
} from "@/lib/t08/validation";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!assertSameOrigin(request)) {
    return NextResponse.json(
      { error: { code: "ORIGIN_NOT_ALLOWED" } },
      { status: 403 },
    );
  }

  const session = await getAuthenticatedSession(request);
  const body = (await request.json().catch(() => null)) as
    | { username?: unknown; displayName?: unknown }
    | null;

  let username: string;
  let displayName: string;
  let webauthnUserId: string;
  let userId: string | undefined;
  let excludeCredentials: Array<{ id: string; type: "public-key" }> = [];

  if (session) {
    username = session.user.username;
    displayName = session.user.display_name;
    webauthnUserId = session.user.webauthn_user_id;
    userId = session.user.id;

    const passkeys = await getPasskeysByUserId(session.user.id);
    excludeCredentials = passkeys.map((passkey) => ({
      id: passkey.credential_id,
      type: "public-key" as const,
    }));
  } else {
    username = normalizeUsername(body?.username) ?? "";
    displayName = normalizeDisplayName(body?.displayName) ?? "";

    if (!username || !displayName) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_PROFILE",
            message: "계정 이름은 영문 소문자·숫자·_·- 3~24자, 표시 이름은 1~40자로 입력해 주세요.",
          },
        },
        { status: 400 },
      );
    }

    const existing = await getUserByUsername(username);
    if (existing) {
      return NextResponse.json(
        {
          error: {
            code: "ACCOUNT_EXISTS_LOGIN_FIRST",
            message: "이미 등록된 계정입니다. 기존 패스키로 로그인한 뒤 새 패스키를 추가해 주세요.",
          },
        },
        { status: 409 },
      );
    }

    webauthnUserId = randomBase64Url(32);
  }

  const challenge = randomBase64Url(32);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
  const row = await createChallenge({
    kind: "registration",
    challenge,
    userId,
    pendingUsername: userId ? undefined : username,
    pendingDisplayName: userId ? undefined : displayName,
    pendingWebauthnUserId: userId ? undefined : webauthnUserId,
    expiresAt,
  });

  const config = getT08Config();

  return NextResponse.json({
    challengeId: row.id,
    mode: session ? "additional" : "bootstrap",
    publicKey: {
      challenge,
      rp: { id: config.rpId, name: config.rpName },
      user: {
        id: webauthnUserId,
        name: username,
        displayName,
      },
      pubKeyCredParams: [{ type: "public-key", alg: -7 }],
      timeout: 60_000,
      attestation: "none",
      authenticatorSelection: {
        residentKey: "required",
        requireResidentKey: true,
        userVerification: "required",
      },
      excludeCredentials,
    },
  });
}
