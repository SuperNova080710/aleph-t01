import { NextRequest, NextResponse } from "next/server";
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

  return NextResponse.json({
    user: {
      id: session.user.id,
      username: session.user.username,
      displayName: session.user.display_name,
      createdAt: session.user.created_at,
    },
  });
}
