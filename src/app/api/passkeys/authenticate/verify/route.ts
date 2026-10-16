import { NextRequest, NextResponse } from "next/server";
import {
  consumeChallenge,
  getPasskeyByCredentialId,
  updatePasskeyCounter,
} from "@/lib/t08/db";
import {
  assertSameOrigin,
  issueSession,
} from "@/lib/t08/session";
import { verifyAuthenticationResponse } from "@/lib/t08/webauthn";

export const runtime = "nodejs";

type AuthenticationBody = {
  challengeId?: unknown;
  credential?: {
    rawId?: unknown;
    clientDataJSON?: unknown;
    authenticatorData?: unknown;
    signature?: unknown;
    userHandle?: unknown;
  };
};

export async function POST(request: NextRequest) {
  if (!assertSameOrigin(request)) {
    return NextResponse.json(
      { error: { code: "ORIGIN_NOT_ALLOWED" } },
      { status: 403 },
    );
  }

  const body = (await request.json().catch(() => null)) as AuthenticationBody | null;
  const challengeId = typeof body?.challengeId === "string" ? body.challengeId : "";
  const credential = body?.credential;

  if (
    !challengeId ||
    typeof credential?.rawId !== "string" ||
    typeof credential.clientDataJSON !== "string" ||
    typeof credential.authenticatorData !== "string" ||
    typeof credential.signature !== "string"
  ) {
    return NextResponse.json(
      { error: { code: "INVALID_AUTHENTICATION_PAYLOAD" } },
      { status: 400 },
    );
  }

  const challenge = await consumeChallenge(challengeId, "authentication");
  if (!challenge) {
    return NextResponse.json(
      {
        error: {
          code: "CHALLENGE_INVALID_OR_USED",
          message: "로그인 질문이 만료되었거나 이미 사용되었습니다.",
        },
      },
      { status: 400 },
    );
  }

  const passkey = await getPasskeyByCredentialId(credential.rawId);
  if (!passkey) {
    return NextResponse.json(
      { error: { code: "UNKNOWN_PASSKEY" } },
      { status: 401 },
    );
  }

  try {
    const verified = await verifyAuthenticationResponse({
      clientDataJSON: credential.clientDataJSON,
      authenticatorData: credential.authenticatorData,
      signature: credential.signature,
      expectedChallenge: challenge.challenge,
      publicKeyJwk: passkey.public_key_jwk,
      previousSignCount: passkey.sign_count,
    });

    if (verified.signCount > passkey.sign_count) {
      await updatePasskeyCounter(passkey.id, verified.signCount);
    }

    const response = NextResponse.json({ ok: true, userId: passkey.user_id });
    await issueSession(response, passkey.user_id);
    return response;
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "SIGNATURE_VERIFICATION_FAILED",
          message: error instanceof Error ? error.message : "서명 검증에 실패했습니다.",
        },
      },
      { status: 401 },
    );
  }
}
