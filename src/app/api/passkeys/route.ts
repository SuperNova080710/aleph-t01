import { NextRequest, NextResponse } from "next/server";
import { getPasskeysByUserId } from "@/lib/t08/db";
import { getAuthenticatedSession } from "@/lib/t08/session";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const session = await getAuthenticatedSession(request);
  if (!session) {
    return NextResponse.json(
      { error: { code: "LOGIN_REQUIRED" } },
      { status: 401 },
    );
  }

  const passkeys = await getPasskeysByUserId(session.user.id);
  return NextResponse.json({
    passkeys: passkeys.map((passkey) => ({
      id: passkey.id,
      label: passkey.label,
      createdAt: passkey.created_at,
      credentialId: passkey.credential_id,
    })),
  });
}
