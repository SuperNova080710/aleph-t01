"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";

function fromBase64Url(value: string): ArrayBuffer {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes.buffer;
}

function toBase64Url(value: ArrayBuffer): string {
  const bytes = new Uint8Array(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

async function readJson(response: Response) {
  return response.json().catch(() => ({}));
}

type SessionUser = {
  id: string;
  username: string;
  displayName: string;
  createdAt: string;
};

type Passkey = {
  id: string;
  label: string;
  createdAt: string;
  credentialId: string;
};

type PrivateItem = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
};

type RegistrationOptions = {
  challengeId: string;
  publicKey: {
    challenge: string;
    rp: { id: string; name: string };
    user: { id: string; name: string; displayName: string };
    pubKeyCredParams: Array<{ type: PublicKeyCredentialType; alg: number }>;
    timeout: number;
    attestation: AttestationConveyancePreference;
    authenticatorSelection: AuthenticatorSelectionCriteria;
    excludeCredentials: Array<{ id: string; type: PublicKeyCredentialType }>;
  };
};

type AuthenticationOptions = {
  challengeId: string;
  publicKey: {
    challenge: string;
    rpId: string;
    timeout: number;
    userVerification: UserVerificationRequirement;
  };
};

export default function PrivatePage() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [passkeys, setPasskeys] = useState<Passkey[]>([]);
  const [items, setItems] = useState<PrivateItem[]>([]);
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [label, setLabel] = useState("내 기기");
  const [message, setMessage] = useState("로그인 상태를 확인하고 있습니다.");
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    const sessionResponse = await fetch("/api/session", { cache: "no-store" });
    if (!sessionResponse.ok) {
      setUser(null);
      setPasskeys([]);
      setItems([]);
      setMessage("패스키로 로그인하면 비공개 자료가 서버에서 내려옵니다.");
      return;
    }

    const session = (await sessionResponse.json()) as { user: SessionUser };
    setUser(session.user);

    const [passkeyResponse, privateResponse] = await Promise.all([
      fetch("/api/passkeys", { cache: "no-store" }),
      fetch("/api/private", { cache: "no-store" }),
    ]);

    const passkeyData = (await readJson(passkeyResponse)) as { passkeys?: Passkey[] };
    const privateData = (await readJson(privateResponse)) as { items?: PrivateItem[] };
    setPasskeys(passkeyData.passkeys ?? []);
    setItems(privateData.items ?? []);
    setMessage("패스키 인증이 확인되었습니다.");
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void refresh();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [refresh]);

  async function registerPasskey(event: FormEvent) {
    event.preventDefault();
    if (!window.PublicKeyCredential || !navigator.credentials) {
      setMessage("이 브라우저는 WebAuthn 패스키를 지원하지 않습니다.");
      return;
    }

    setBusy(true);
    let challengeId = "";

    try {
      const optionsResponse = await fetch("/api/passkeys/register/options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user ? {} : { username, displayName }),
      });
      const optionsData = (await readJson(optionsResponse)) as
        | RegistrationOptions
        | { error?: { message?: string; code?: string } };

      if (!optionsResponse.ok || !("publicKey" in optionsData)) {
        throw new Error(
          "error" in optionsData
            ? optionsData.error?.message || optionsData.error?.code
            : "등록 옵션을 만들지 못했습니다.",
        );
      }

      challengeId = optionsData.challengeId;
      const options = optionsData.publicKey;
      const credential = (await navigator.credentials.create({
        publicKey: {
          ...options,
          challenge: fromBase64Url(options.challenge),
          user: {
            ...options.user,
            id: fromBase64Url(options.user.id),
          },
          excludeCredentials: options.excludeCredentials.map((item) => ({
            ...item,
            id: fromBase64Url(item.id),
          })),
        },
      })) as PublicKeyCredential | null;

      if (!credential) throw new Error("패스키 등록 응답을 받지 못했습니다.");
      const response = credential.response as AuthenticatorAttestationResponse;

      const verifyResponse = await fetch("/api/passkeys/register/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challengeId,
          label,
          credential: {
            rawId: toBase64Url(credential.rawId),
            clientDataJSON: toBase64Url(response.clientDataJSON),
            attestationObject: toBase64Url(response.attestationObject),
          },
        }),
      });
      const verifyData = await readJson(verifyResponse);
      if (!verifyResponse.ok) {
        const error = verifyData as { error?: { message?: string; code?: string } };
        throw new Error(error.error?.message || error.error?.code || "등록 검증에 실패했습니다.");
      }

      setMessage("패스키를 등록했습니다. 서버에는 공개키만 저장됩니다.");
      setUsername("");
      setDisplayName("");
      await refresh();
    } catch (error) {
      if (challengeId) {
        await fetch("/api/passkeys/challenge/cancel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ challengeId }),
        }).catch(() => undefined);
      }

      const cancelled = error instanceof DOMException && error.name === "NotAllowedError";
      setMessage(
        cancelled
          ? "패스키 등록을 취소했습니다. 등록 정보는 저장되지 않았습니다."
          : error instanceof Error
            ? error.message
            : "패스키 등록에 실패했습니다.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function login() {
    if (!window.PublicKeyCredential || !navigator.credentials) {
      setMessage("이 브라우저는 WebAuthn 패스키를 지원하지 않습니다.");
      return;
    }

    setBusy(true);
    let challengeId = "";

    try {
      const optionsResponse = await fetch("/api/passkeys/authenticate/options", {
        method: "POST",
      });
      const optionsData = (await readJson(optionsResponse)) as AuthenticationOptions;
      if (!optionsResponse.ok) throw new Error("로그인 질문을 만들지 못했습니다.");

      challengeId = optionsData.challengeId;
      const options = optionsData.publicKey;
      const credential = (await navigator.credentials.get({
        publicKey: {
          ...options,
          challenge: fromBase64Url(options.challenge),
        },
      })) as PublicKeyCredential | null;

      if (!credential) throw new Error("패스키 로그인 응답을 받지 못했습니다.");
      const response = credential.response as AuthenticatorAssertionResponse;

      const verifyResponse = await fetch("/api/passkeys/authenticate/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challengeId,
          credential: {
            rawId: toBase64Url(credential.rawId),
            clientDataJSON: toBase64Url(response.clientDataJSON),
            authenticatorData: toBase64Url(response.authenticatorData),
            signature: toBase64Url(response.signature),
            userHandle: response.userHandle ? toBase64Url(response.userHandle) : null,
          },
        }),
      });
      const verifyData = await readJson(verifyResponse);
      if (!verifyResponse.ok) {
        const error = verifyData as { error?: { message?: string; code?: string } };
        throw new Error(error.error?.message || error.error?.code || "로그인 검증에 실패했습니다.");
      }

      setMessage("패스키 서명 검증에 성공했습니다.");
      await refresh();
    } catch (error) {
      setMessage(
        error instanceof DOMException && error.name === "NotAllowedError"
          ? "패스키 로그인을 취소했습니다."
          : error instanceof Error
            ? error.message
            : "패스키 로그인에 실패했습니다.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    setBusy(true);
    const response = await fetch("/api/logout", { method: "POST" });
    setBusy(false);
    if (!response.ok) {
      setMessage("로그아웃에 실패했습니다.");
      return;
    }
    await refresh();
    setMessage("로그아웃했습니다. 기존 세션은 서버에서 폐기되었습니다.");
  }

  async function deletePasskey(id: string) {
    setBusy(true);
    const response = await fetch(`/api/passkeys/${id}`, { method: "DELETE" });
    const data = (await readJson(response)) as { error?: { message?: string; code?: string } };
    setBusy(false);

    if (!response.ok) {
      setMessage(data.error?.message || data.error?.code || "패스키 삭제에 실패했습니다.");
      return;
    }

    setMessage("패스키를 삭제했습니다. 삭제된 패스키로는 더 이상 로그인할 수 없습니다.");
    await refresh();
  }

  return (
    <main className="private-portfolio-page min-h-screen bg-[#DDD8CE] text-[#172033]">
      <header className="border-b border-[#C3BDB2] bg-[#ECE8E0]">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-sm font-bold tracking-[0.18em] text-[#172033]">
            DEVELOPER PROFILE
          </Link>
          <span className="border border-[#263B5E] px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-[#263B5E]">
            Private · Passkey
          </span>
        </div>
      </header>

      <section className="border-b border-[#C3BDB2] bg-[#ECE8E0]">
        <div className="mx-auto max-w-5xl px-6 py-14">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#4F5868]">T08 Private Area</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-[-0.04em] sm:text-5xl">
            공개 소개와 비공개 영역을 서버에서 분리했습니다.
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-[#4F5868]">
            공개 소개 페이지는 누구나 볼 수 있습니다. 보호 데이터의 구체적인 내용은 패스키 서명을 서버가 검증한 뒤에만 별도 API로 내려옵니다. 이 과제의 보호 데이터는 모두 가상 내용이며 실제 개인정보가 아닙니다.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="border border-[#C3BDB2] bg-[#DDD8CE] p-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#4F5868]">Public</p>
              <p className="mt-2 font-bold">자기소개 · 프로젝트 · 강점 · 공개 근거</p>
              <Link href="/" className="mt-4 inline-block text-sm font-bold text-[#263B5E] underline underline-offset-4">
                공개 소개로 돌아가기
              </Link>
            </div>
            <div className="border border-[#263B5E] bg-[#172033] p-5 text-[#ECE8E0]">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#C3BDB2]">Private</p>
              <p className="mt-2 font-bold">인증 성공 후에만 확인할 수 있는 보호 데이터</p>
              <p className="mt-3 text-sm leading-6 text-[#C3BDB2]">로그인 전에는 항목의 제목과 내용 자체를 서버가 보내지 않습니다.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-8 px-6 py-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <div className="border border-[#C3BDB2] bg-[#ECE8E0] p-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#4F5868]">Authentication</p>
            <h2 className="mt-3 text-2xl font-bold">{user ? `${user.displayName}님` : "패스키로 들어가기"}</h2>
            <p className="mt-3 text-sm leading-7 text-[#4F5868]" aria-live="polite">{message}</p>

            {!user ? (
              <div className="mt-6 space-y-6">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void login()}
                  className="w-full bg-[#172033] px-4 py-3 font-bold text-[#ECE8E0] disabled:opacity-50"
                >
                  기존 패스키로 로그인
                </button>

                <form onSubmit={registerPasskey} className="border-t border-[#C3BDB2] pt-6">
                  <p className="font-bold">처음 사용하는 계정이라면</p>
                  <label className="mt-4 block text-sm font-bold">
                    계정 이름
                    <input
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      pattern="[a-z0-9_-]{3,24}"
                      required
                      placeholder="odyz-demo-a"
                      className="mt-2 w-full border border-[#C3BDB2] bg-white px-3 py-2 font-normal"
                    />
                  </label>
                  <label className="mt-4 block text-sm font-bold">
                    표시 이름
                    <input
                      value={displayName}
                      onChange={(event) => setDisplayName(event.target.value)}
                      required
                      maxLength={40}
                      placeholder="테스트 계정 A"
                      className="mt-2 w-full border border-[#C3BDB2] bg-white px-3 py-2 font-normal"
                    />
                  </label>
                  <label className="mt-4 block text-sm font-bold">
                    패스키 이름
                    <input
                      value={label}
                      onChange={(event) => setLabel(event.target.value)}
                      required
                      maxLength={40}
                      className="mt-2 w-full border border-[#C3BDB2] bg-white px-3 py-2 font-normal"
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={busy}
                    className="mt-5 w-full border border-[#172033] px-4 py-3 font-bold disabled:opacity-50"
                  >
                    첫 패스키 등록
                  </button>
                </form>
              </div>
            ) : (
              <button
                type="button"
                disabled={busy}
                onClick={() => void logout()}
                className="mt-6 w-full border border-[#172033] px-4 py-3 font-bold disabled:opacity-50"
              >
                로그아웃
              </button>
            )}
          </div>

          {user && (
            <div className="border border-[#C3BDB2] bg-[#ECE8E0] p-6">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#4F5868]">Passkeys</p>
              <h2 className="mt-3 text-2xl font-bold">등록된 패스키 {passkeys.length}개</h2>
              <p className="mt-2 break-all text-xs text-[#4F5868]">계정 ID: {user.id}</p>

              <ul className="mt-5 divide-y divide-[#C3BDB2] border-y border-[#C3BDB2]">
                {passkeys.map((passkey) => (
                  <li key={passkey.id} className="flex items-center justify-between gap-4 py-4">
                    <div>
                      <p className="font-bold">{passkey.label}</p>
                      <p className="mt-1 text-xs text-[#4F5868]">{new Date(passkey.createdAt).toLocaleString("ko-KR")}</p>
                    </div>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void deletePasskey(passkey.id)}
                      className="text-sm font-bold underline underline-offset-4 disabled:opacity-50"
                    >
                      삭제
                    </button>
                  </li>
                ))}
              </ul>

              <form onSubmit={registerPasskey} className="mt-6">
                <label className="block text-sm font-bold">
                  새 패스키 이름
                  <input
                    value={label}
                    onChange={(event) => setLabel(event.target.value)}
                    required
                    maxLength={40}
                    className="mt-2 w-full border border-[#C3BDB2] bg-white px-3 py-2 font-normal"
                  />
                </label>
                <button
                  type="submit"
                  disabled={busy}
                  className="mt-4 w-full bg-[#263B5E] px-4 py-3 font-bold text-white disabled:opacity-50"
                >
                  두 번째 패스키 추가
                </button>
                <p className="mt-3 text-xs leading-6 text-[#4F5868]">마지막 패스키는 삭제할 수 없도록 서버에서 막습니다. 다른 패스키를 먼저 등록해야 삭제할 수 있습니다.</p>
              </form>
            </div>
          )}
        </div>

        <div className="border border-[#172033] bg-[#172033] p-6 text-[#ECE8E0]">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#C3BDB2]">Protected data</p>
          <h2 className="mt-3 text-2xl font-bold">나만의 자리</h2>

          {!user ? (
            <div className="mt-8 border border-[#4F5868] p-6">
              <p className="text-lg font-bold">잠겨 있습니다.</p>
              <p className="mt-3 text-sm leading-7 text-[#C3BDB2]">이 화면의 HTML에는 보호 데이터의 구체적인 항목이 포함되어 있지 않습니다. 인증 성공 후 `/api/private`에서만 가져옵니다.</p>
            </div>
          ) : (
            <div className="mt-8 space-y-4">
              {items.map((item, index) => (
                <article key={item.id} className="border border-[#4F5868] p-5">
                  <p className="text-xs font-bold text-[#C3BDB2]">0{index + 1}</p>
                  <h3 className="mt-3 text-lg font-bold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#C3BDB2]">{item.content}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
