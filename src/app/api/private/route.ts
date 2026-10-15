import { NextRequest, NextResponse } from "next/server";
import { getPrivateItems } from "@/lib/t08/db";
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

  const items = await getPrivateItems(session.user.id);
  const requestedUserId = request.nextUrl.searchParams.get("userId");

  return NextResponse.json({
    owner: {
      id: session.user.id,
      username: session.user.username,
      displayName: session.user.display_name,
    },
    requestedUserIdIgnored:
      requestedUserId !== null && requestedUserId !== session.user.id,
    items: items.map((item) => ({
      id: item.id,
      title: item.title,
      content: item.content,
      createdAt: item.created_at,
    })),
  });
}
