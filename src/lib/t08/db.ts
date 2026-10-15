import { getT08Config } from "./config";

export type T08User = {
  id: string;
  username: string;
  display_name: string;
  webauthn_user_id: string;
  created_at: string;
};

export type PasskeyRow = {
  id: string;
  user_id: string;
  credential_id: string;
  public_key_jwk: JsonWebKey;
  sign_count: number;
  label: string;
  created_at: string;
};

export type ChallengeRow = {
  id: string;
  kind: "registration" | "authentication";
  challenge: string;
  user_id: string | null;
  pending_username: string | null;
  pending_display_name: string | null;
  pending_webauthn_user_id: string | null;
  expires_at: string;
  created_at: string;
};

export type SessionRow = {
  token_hash: string;
  user_id: string;
  expires_at: string;
  created_at: string;
};

export type PrivateItem = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
};

class DbRequestError extends Error {
  constructor(
    public readonly status: number,
    public readonly detail: string,
  ) {
    super(`Supabase request failed (${status}): ${detail}`);
  }
}

async function dbRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const config = getT08Config();
  const response = await fetch(`${config.supabaseUrl}/rest/v1/${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      apikey: config.supabaseServiceRoleKey,
      Authorization: `Bearer ${config.supabaseServiceRoleKey}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  const text = await response.text();
  if (!response.ok) {
    throw new DbRequestError(response.status, text || response.statusText);
  }

  return (text ? JSON.parse(text) : null) as T;
}

function eq(value: string): string {
  return encodeURIComponent(`eq.${value}`);
}

export async function getUserByUsername(
  username: string,
): Promise<T08User | null> {
  const rows = await dbRequest<T08User[]>(
    `t08_users?username=${eq(username)}&select=*&limit=1`,
  );
  return rows[0] ?? null;
}

export async function getUserById(id: string): Promise<T08User | null> {
  const rows = await dbRequest<T08User[]>(
    `t08_users?id=${eq(id)}&select=*&limit=1`,
  );
  return rows[0] ?? null;
}

export async function getPasskeysByUserId(
  userId: string,
): Promise<PasskeyRow[]> {
  return dbRequest<PasskeyRow[]>(
    `t08_passkeys?user_id=${eq(userId)}&select=*&order=created_at.asc`,
  );
}

export async function getPasskeyByCredentialId(
  credentialId: string,
): Promise<PasskeyRow | null> {
  const rows = await dbRequest<PasskeyRow[]>(
    `t08_passkeys?credential_id=${eq(credentialId)}&select=*&limit=1`,
  );
  return rows[0] ?? null;
}

export async function createChallenge(input: {
  kind: ChallengeRow["kind"];
  challenge: string;
  userId?: string;
  pendingUsername?: string;
  pendingDisplayName?: string;
  pendingWebauthnUserId?: string;
  expiresAt: string;
}): Promise<ChallengeRow> {
  const rows = await dbRequest<ChallengeRow[]>("t08_challenges?select=*", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      kind: input.kind,
      challenge: input.challenge,
      user_id: input.userId ?? null,
      pending_username: input.pendingUsername ?? null,
      pending_display_name: input.pendingDisplayName ?? null,
      pending_webauthn_user_id: input.pendingWebauthnUserId ?? null,
      expires_at: input.expiresAt,
    }),
  });
  return rows[0];
}

export async function consumeChallenge(
  id: string,
  kind: ChallengeRow["kind"],
): Promise<ChallengeRow | null> {
  const rows = await dbRequest<ChallengeRow[]>("rpc/t08_consume_challenge", {
    method: "POST",
    body: JSON.stringify({ p_id: id, p_kind: kind }),
  });
  return rows[0] ?? null;
}

export async function cancelChallenge(id: string): Promise<void> {
  await dbRequest<null>(`t08_challenges?id=${eq(id)}`, {
    method: "DELETE",
    headers: { Prefer: "return=minimal" },
  });
}

export async function registerFirstPasskey(input: {
  username: string;
  displayName: string;
  webauthnUserId: string;
  credentialId: string;
  publicKeyJwk: JsonWebKey;
  signCount: number;
  label: string;
}): Promise<string> {
  const rows = await dbRequest<Array<{ user_id: string }>>(
    "rpc/t08_register_first_passkey",
    {
      method: "POST",
      body: JSON.stringify({
        p_username: input.username,
        p_display_name: input.displayName,
        p_webauthn_user_id: input.webauthnUserId,
        p_credential_id: input.credentialId,
        p_public_key_jwk: input.publicKeyJwk,
        p_sign_count: input.signCount,
        p_label: input.label,
      }),
    },
  );

  const userId = rows[0]?.user_id;
  if (!userId) throw new Error("첫 패스키 등록 결과에서 사용자 ID를 받지 못했습니다.");
  return userId;
}

export async function addPasskey(input: {
  userId: string;
  credentialId: string;
  publicKeyJwk: JsonWebKey;
  signCount: number;
  label: string;
}): Promise<void> {
  await dbRequest<null>("t08_passkeys", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      user_id: input.userId,
      credential_id: input.credentialId,
      public_key_jwk: input.publicKeyJwk,
      sign_count: input.signCount,
      label: input.label,
    }),
  });
}

export async function updatePasskeyCounter(
  id: string,
  signCount: number,
): Promise<void> {
  await dbRequest<null>(`t08_passkeys?id=${eq(id)}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ sign_count: signCount }),
  });
}

export async function deletePasskeyIfRedundant(
  userId: string,
  passkeyId: string,
): Promise<boolean> {
  return dbRequest<boolean>("rpc/t08_delete_passkey_if_redundant", {
    method: "POST",
    body: JSON.stringify({ p_user_id: userId, p_passkey_id: passkeyId }),
  });
}

export async function createSession(input: {
  tokenHash: string;
  userId: string;
  expiresAt: string;
}): Promise<void> {
  await dbRequest<null>("t08_sessions", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      token_hash: input.tokenHash,
      user_id: input.userId,
      expires_at: input.expiresAt,
    }),
  });
}

export async function getSessionByHash(
  tokenHash: string,
): Promise<SessionRow | null> {
  const rows = await dbRequest<SessionRow[]>(
    `t08_sessions?token_hash=${eq(tokenHash)}&select=*&limit=1`,
  );
  return rows[0] ?? null;
}

export async function deleteSessionByHash(tokenHash: string): Promise<void> {
  await dbRequest<null>(`t08_sessions?token_hash=${eq(tokenHash)}`, {
    method: "DELETE",
    headers: { Prefer: "return=minimal" },
  });
}

export async function getPrivateItems(userId: string): Promise<PrivateItem[]> {
  return dbRequest<PrivateItem[]>(
    `t08_private_items?user_id=${eq(userId)}&select=*&order=created_at.asc`,
  );
}

export function isDbRequestError(error: unknown): error is DbRequestError {
  return error instanceof DbRequestError;
}
