import { NextRequest, NextResponse } from "next/server";
import { assertSameOrigin, revokeSession } from "@/lib/t08/session";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!assertSameOrigin(request)) {
    return NextResponse.json(
      { error: { code: "ORIGIN_NOT_ALLOWED" } },
      { status: 403 },
    );
  }

  const response = NextResponse.json({ ok: true });
  await revokeSession(request, response);
  return response;
}
