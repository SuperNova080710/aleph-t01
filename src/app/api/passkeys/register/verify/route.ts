import { NextRequest, NextResponse } from "next/server";
import {
  addPasskey,
  consumeChallenge,
  isDbRequestError,
  registerFirstPasskey,
} from "@/lib/t08/db";
import {
  assertSameOrigin,
  getAuthenticatedSession,
  issueSession,
} from "@/lib/t08/session";
import { normalizePasskeyLabel } from "@/lib/t08/validation";
import { verifyRegistrationResponse } from "@/lib/t08/webauthn";

export const runtime = "nodejs";

type RegistrationBody = {
  challengeId?: unknown;
  label?: unknown;
  credential?: {
    rawId?: unknown;
    clientDataJSON?: unknown;
    attestationObject?: unknown;
  };
};

export async function POST(request: NextRequest) {
  if (!assertSameOrigin(request)) {
    return NextResponse.json(
      { error: { code: "ORIGIN_NOT_ALLOWED" } },
      { status: 403 },
    );
  }

  const body = (await request.json().catch(() => null)) as RegistrationBody | null;
  const challengeId = typeof body?.challengeId === "string" ? body.challengeId : "";
  const label = normalizePasskeyLabel(body?.label);
  const credential = body?.credential;

  if (
    !challengeId ||
    !label ||
    typeof credential?.rawId !== "string" ||
    typeof credential.clientDataJSON !== "string" ||
    typeof credential.attestationObject !== "string"
  ) {
    return NextResponse.json(
      { error: { code: "INVALID_REGISTRATION_PAYLOAD" } },
      { status: 400 },
    );
  }

  const challenge = await consumeChallenge(challengeId, "registration");
  if (!challenge) {
    return NextResponse.json(
      {
        error: {
          code: "CHALLENGE_INVALID_OR_USED",
          message: "등록 질문이 만료되었거나 이미 사용되었습니다.",
        },
      },
      { status: 400 },
    );
  }

  try {
    const verified = verifyRegistrationResponse({
      rawId: credential.rawId,
      clientDataJSON: credential.clientDataJSON,
      attestationObject: credential.attestationObject,
      expectedChallenge: challenge.challenge,
    });

    let userId: string;

    if (challenge.user_id) {
      const session = await getAuthenticatedSession(request);
      if (!session || session.user.id !== challenge.user_id) {
        return NextResponse.json(
          { error: { code: "LOGIN_REQUIRED_FOR_ADDITIONAL_PASSKEY" } },
          { status: 401 },
        );
      }

      await addPasskey({
        userId: session.user.id,
        credentialId: verified.credentialId,
        publicKeyJwk: verified.publicKeyJwk,
        signCount: verified.signCount,
        label,
      });
      userId = session.user.id;
    } else {
      if (
        !challenge.pending_username ||
        !challenge.pending_display_name ||
        !challenge.pending_webauthn_user_id
      ) {
        throw new Error("초기 등록 challenge에 계정 정보가 없습니다.");
      }

      userId = await registerFirstPasskey({
        username: challenge.pending_username,
        displayName: challenge.pending_display_name,
        webauthnUserId: challenge.pending_webauthn_user_id,
        credentialId: verified.credentialId,
        publicKeyJwk: verified.publicKeyJwk,
        signCount: verified.signCount,
        label,
      });
    }

    const response = NextResponse.json({
      ok: true,
      credentialId: verified.credentialId,
      stored: "public-key-only",
    });

    if (!challenge.user_id) {
      await issueSession(response, userId);
    }

    return response;
  } catch (error) {
    if (isDbRequestError(error) && error.status === 409) {
      return NextResponse.json(
        { error: { code: "PASSKEY_OR_ACCOUNT_ALREADY_EXISTS" } },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        error: {
          code: "REGISTRATION_VERIFICATION_FAILED",
          message: error instanceof Error ? error.message : "등록 검증에 실패했습니다.",
        },
      },
      { status: 400 },
    );
  }
}
