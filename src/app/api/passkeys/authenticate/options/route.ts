import { NextRequest, NextResponse } from "next/server";
import { getT08Config } from "@/lib/t08/config";
import { createChallenge } from "@/lib/t08/db";
import { randomBase64Url } from "@/lib/t08/encoding";
import { assertSameOrigin } from "@/lib/t08/session";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!assertSameOrigin(request)) {
    return NextResponse.json(
      { error: { code: "ORIGIN_NOT_ALLOWED" } },
      { status: 403 },
    );
  }

  const challenge = randomBase64Url(32);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
  const row = await createChallenge({
    kind: "authentication",
    challenge,
    expiresAt,
  });
  const config = getT08Config();

  return NextResponse.json({
    challengeId: row.id,
    publicKey: {
      challenge,
      rpId: config.rpId,
      timeout: 60_000,
      userVerification: "required",
    },
  });
}
