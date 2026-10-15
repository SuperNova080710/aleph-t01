import { NextRequest, NextResponse } from "next/server";
import { getPrivateItems } from "@/lib/t08/db";
import { getAuthenticatedSession } from "@/lib/t08/session";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> },
) {
  const session = await getAuthenticatedSession(request);
  if (!session) {
    return NextResponse.json(
      { error: { code: "LOGIN_REQUIRED" } },
      { status: 401 },
    );
  }

  const { userId } = await context.params;
  if (userId !== session.user.id) {
    return NextResponse.json(
      {
        error: {
          code: "FORBIDDEN_OTHER_USER",
          message: "다른 계정의 비공개 자료는 읽을 수 없습니다.",
        },
      },
      { status: 403 },
    );
  }

  const items = await getPrivateItems(session.user.id);
  return NextResponse.json({
    ownerId: session.user.id,
    count: items.length,
    items: items.map((item) => ({
      id: item.id,
      title: item.title,
      content: item.content,
    })),
  });
}
