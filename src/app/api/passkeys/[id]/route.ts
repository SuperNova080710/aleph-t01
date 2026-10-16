import { NextRequest, NextResponse } from "next/server";
import { deletePasskeyIfRedundant } from "@/lib/t08/db";
import {
  assertSameOrigin,
  getAuthenticatedSession,
} from "@/lib/t08/session";

export const runtime = "nodejs";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!assertSameOrigin(request)) {
    return NextResponse.json(
      { error: { code: "ORIGIN_NOT_ALLOWED" } },
      { status: 403 },
    );
  }

  const session = await getAuthenticatedSession(request);
  if (!session) {
    return NextResponse.json(
      { error: { code: "LOGIN_REQUIRED" } },
      { status: 401 },
    );
  }

  const { id } = await context.params;
  const deleted = await deletePasskeyIfRedundant(session.user.id, id);

  if (!deleted) {
    return NextResponse.json(
      {
        error: {
          code: "LAST_PASSKEY_PROTECTED",
          message: "마지막 패스키는 삭제할 수 없습니다. 다른 패스키를 먼저 등록해 주세요.",
        },
      },
      { status: 409 },
    );
  }

  return NextResponse.json({ ok: true });
}
