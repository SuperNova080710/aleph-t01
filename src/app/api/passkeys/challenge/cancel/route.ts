import { NextRequest, NextResponse } from "next/server";
import { cancelChallenge } from "@/lib/t08/db";
import { assertSameOrigin } from "@/lib/t08/session";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!assertSameOrigin(request)) {
    return NextResponse.json(
      { error: { code: "ORIGIN_NOT_ALLOWED" } },
      { status: 403 },
    );
  }

  const body = (await request.json().catch(() => null)) as
    | { challengeId?: unknown }
    | null;
  const challengeId =
    typeof body?.challengeId === "string" ? body.challengeId : "";

  if (!challengeId) {
    return NextResponse.json(
      { error: { code: "INVALID_CHALLENGE_ID" } },
      { status: 400 },
    );
  }

  await cancelChallenge(challengeId);
  return NextResponse.json({ ok: true });
}
