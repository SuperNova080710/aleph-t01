import { webcrypto } from "node:crypto";
import { getT08Config } from "./config";
import {
  bytesEqual,
  fromBase64Url,
  sha256Bytes,
  toBase64Url,
} from "./encoding";

const subtle = webcrypto.subtle;

type CborValue =
  | number
  | string
  | Uint8Array
  | CborValue[]
  | Map<CborValue, CborValue>
  | boolean
  | null;

type DecodedCbor = { value: CborValue; offset: number };

function readCborLength(
  bytes: Uint8Array,
  additional: number,
  offset: number,
): { length: number; offset: number } {
  if (additional < 24) return { length: additional, offset };
  if (additional === 24) return { length: bytes[offset], offset: offset + 1 };
  if (additional === 25) {
    const view = new DataView(bytes.buffer, bytes.byteOffset + offset, 2);
    return { length: view.getUint16(0), offset: offset + 2 };
  }
  if (additional === 26) {
    const view = new DataView(bytes.buffer, bytes.byteOffset + offset, 4);
    return { length: view.getUint32(0), offset: offset + 4 };
  }
  throw new Error("지원하지 않는 CBOR 길이 형식입니다.");
}

function decodeCbor(bytes: Uint8Array, start = 0): DecodedCbor {
  if (start >= bytes.length) throw new Error("CBOR 데이터가 비어 있습니다.");

  const first = bytes[start];
  const major = first >> 5;
  const additional = first & 0x1f;
  const lengthInfo = readCborLength(bytes, additional, start + 1);
  const length = lengthInfo.length;
  let offset = lengthInfo.offset;

  if (major === 0) return { value: length, offset };
  if (major === 1) return { value: -1 - length, offset };

  if (major === 2) {
    const end = offset + length;
    if (end > bytes.length) throw new Error("CBOR byte string 길이가 잘못되었습니다.");
    return { value: bytes.slice(offset, end), offset: end };
  }

  if (major === 3) {
    const end = offset + length;
    if (end > bytes.length) throw new Error("CBOR text string 길이가 잘못되었습니다.");
    return {
      value: new TextDecoder().decode(bytes.slice(offset, end)),
      offset: end,
    };
  }

  if (major === 4) {
    const values: CborValue[] = [];
    for (let index = 0; index < length; index += 1) {
      const decoded = decodeCbor(bytes, offset);
      values.push(decoded.value);
      offset = decoded.offset;
    }
    return { value: values, offset };
  }

  if (major === 5) {
    const values = new Map<CborValue, CborValue>();
    for (let index = 0; index < length; index += 1) {
      const key = decodeCbor(bytes, offset);
      const value = decodeCbor(bytes, key.offset);
      values.set(key.value, value.value);
      offset = value.offset;
    }
    return { value: values, offset };
  }

  if (major === 7) {
    if (additional === 20) return { value: false, offset: start + 1 };
    if (additional === 21) return { value: true, offset: start + 1 };
    if (additional === 22) return { value: null, offset: start + 1 };
  }

  throw new Error(`지원하지 않는 CBOR major type입니다: ${major}`);
}

function getMapValue<T extends CborValue>(
  map: Map<CborValue, CborValue>,
  key: CborValue,
): T {
  const value = map.get(key);
  if (value === undefined) throw new Error(`CBOR 키 ${String(key)}가 없습니다.`);
  return value as T;
}

function parseClientData(
  encodedClientData: string,
  expectedType: "webauthn.create" | "webauthn.get",
  expectedChallenge: string,
): Uint8Array {
  const bytes = fromBase64Url(encodedClientData);
  const parsed = JSON.parse(new TextDecoder().decode(bytes)) as {
    type?: string;
    challenge?: string;
    origin?: string;
    crossOrigin?: boolean;
  };

  if (parsed.type !== expectedType) {
    throw new Error("WebAuthn clientData type이 올바르지 않습니다.");
  }
  if (parsed.challenge !== expectedChallenge) {
    throw new Error("WebAuthn challenge가 일치하지 않습니다.");
  }
  if (parsed.origin !== getT08Config().origin) {
    throw new Error("WebAuthn origin이 일치하지 않습니다.");
  }
  if (parsed.crossOrigin === true) {
    throw new Error("교차 출처 WebAuthn 응답은 허용하지 않습니다.");
  }

  return bytes;
}

function parseAuthenticatorData(bytes: Uint8Array) {
  if (bytes.length < 37) throw new Error("authenticatorData 길이가 너무 짧습니다.");

  const rpIdHash = bytes.slice(0, 32);
  const flags = bytes[32];
  const view = new DataView(bytes.buffer, bytes.byteOffset + 33, 4);
  const signCount = view.getUint32(0, false);

  return { rpIdHash, flags, signCount, offset: 37 };
}

function validateAuthenticatorBase(rpIdHash: Uint8Array, flags: number): void {
  const expectedRpIdHash = sha256Bytes(
    new TextEncoder().encode(getT08Config().rpId),
  );
  if (!bytesEqual(rpIdHash, expectedRpIdHash)) {
    throw new Error("Relying Party ID hash가 일치하지 않습니다.");
  }

  const userPresent = (flags & 0x01) !== 0;
  const userVerified = (flags & 0x04) !== 0;
  if (!userPresent || !userVerified) {
    throw new Error("사용자 존재 확인과 사용자 검증이 모두 필요합니다.");
  }
}

function normalizeEcCoordinate(value: CborValue, name: string): Uint8Array {
  if (!(value instanceof Uint8Array) || value.length !== 32) {
    throw new Error(`${name} 공개키 좌표가 올바르지 않습니다.`);
  }
  return value;
}

export function verifyRegistrationResponse(input: {
  clientDataJSON: string;
  attestationObject: string;
  rawId: string;
  expectedChallenge: string;
}): { credentialId: string; publicKeyJwk: JsonWebKey; signCount: number } {
  parseClientData(
    input.clientDataJSON,
    "webauthn.create",
    input.expectedChallenge,
  );

  const attestationBytes = fromBase64Url(input.attestationObject);
  const decoded = decodeCbor(attestationBytes).value;
  if (!(decoded instanceof Map)) throw new Error("attestationObject 형식이 잘못되었습니다.");

  const format = getMapValue<string>(decoded, "fmt");
  if (format !== "none") {
    throw new Error("이 구현은 attestation=none 형식만 허용합니다.");
  }

  const authData = getMapValue<Uint8Array>(decoded, "authData");
  if (!(authData instanceof Uint8Array)) {
    throw new Error("attestationObject에 authenticatorData가 없습니다.");
  }

  const parsed = parseAuthenticatorData(authData);
  validateAuthenticatorBase(parsed.rpIdHash, parsed.flags);

  const attestedCredentialDataIncluded = (parsed.flags & 0x40) !== 0;
  if (!attestedCredentialDataIncluded) {
    throw new Error("등록 응답에 attested credential data가 없습니다.");
  }

  let offset = parsed.offset + 16;
  if (authData.length < offset + 2) throw new Error("credential ID 길이를 읽을 수 없습니다.");

  const credentialIdLength = new DataView(
    authData.buffer,
    authData.byteOffset + offset,
    2,
  ).getUint16(0, false);
  offset += 2;

  const credentialIdBytes = authData.slice(offset, offset + credentialIdLength);
  offset += credentialIdLength;
  const rawIdBytes = fromBase64Url(input.rawId);

  if (!bytesEqual(credentialIdBytes, rawIdBytes)) {
    throw new Error("등록 응답의 credential ID가 일치하지 않습니다.");
  }

  const credentialPublicKey = decodeCbor(authData, offset).value;
  if (!(credentialPublicKey instanceof Map)) {
    throw new Error("credential 공개키가 COSE_Key 형식이 아닙니다.");
  }

  const kty = getMapValue<number>(credentialPublicKey, 1);
  const alg = getMapValue<number>(credentialPublicKey, 3);
  const crv = getMapValue<number>(credentialPublicKey, -1);
  const x = normalizeEcCoordinate(getMapValue(credentialPublicKey, -2), "x");
  const y = normalizeEcCoordinate(getMapValue(credentialPublicKey, -3), "y");

  if (kty !== 2 || alg !== -7 || crv !== 1) {
    throw new Error("ES256 / P-256 패스키만 허용합니다.");
  }

  return {
    credentialId: toBase64Url(credentialIdBytes),
    publicKeyJwk: {
      kty: "EC",
      crv: "P-256",
      x: toBase64Url(x),
      y: toBase64Url(y),
      ext: true,
      key_ops: ["verify"],
    },
    signCount: parsed.signCount,
  };
}

function derLength(bytes: Uint8Array, offset: number): { length: number; offset: number } {
  const first = bytes[offset];
  if ((first & 0x80) === 0) return { length: first, offset: offset + 1 };

  const count = first & 0x7f;
  if (count < 1 || count > 2) throw new Error("지원하지 않는 DER 길이입니다.");

  let length = 0;
  for (let index = 0; index < count; index += 1) {
    length = (length << 8) | bytes[offset + 1 + index];
  }
  return { length, offset: offset + 1 + count };
}

function trimAndPadInteger(value: Uint8Array): Uint8Array {
  let start = 0;
  while (start < value.length - 1 && value[start] === 0) start += 1;
  const trimmed = value.slice(start);
  if (trimmed.length > 32) throw new Error("ECDSA 정수 길이가 너무 깁니다.");

  const output = new Uint8Array(32);
  output.set(trimmed, 32 - trimmed.length);
  return output;
}

function derEcdsaToRaw(signature: Uint8Array): Uint8Array {
  let offset = 0;
  if (signature[offset++] !== 0x30) throw new Error("ECDSA DER sequence가 아닙니다.");
  const sequence = derLength(signature, offset);
  offset = sequence.offset;
  const sequenceEnd = offset + sequence.length;

  if (signature[offset++] !== 0x02) throw new Error("ECDSA r 값이 없습니다.");
  const rLength = derLength(signature, offset);
  offset = rLength.offset;
  const r = signature.slice(offset, offset + rLength.length);
  offset += rLength.length;

  if (signature[offset++] !== 0x02) throw new Error("ECDSA s 값이 없습니다.");
  const sLength = derLength(signature, offset);
  offset = sLength.offset;
  const s = signature.slice(offset, offset + sLength.length);
  offset += sLength.length;

  if (offset !== sequenceEnd) throw new Error("ECDSA DER signature 길이가 잘못되었습니다.");

  const raw = new Uint8Array(64);
  raw.set(trimAndPadInteger(r), 0);
  raw.set(trimAndPadInteger(s), 32);
  return raw;
}

export async function verifyAuthenticationResponse(input: {
  clientDataJSON: string;
  authenticatorData: string;
  signature: string;
  expectedChallenge: string;
  publicKeyJwk: JsonWebKey;
  previousSignCount: number;
}): Promise<{ signCount: number }> {
  const clientDataBytes = parseClientData(
    input.clientDataJSON,
    "webauthn.get",
    input.expectedChallenge,
  );
  const authenticatorData = fromBase64Url(input.authenticatorData);
  const parsed = parseAuthenticatorData(authenticatorData);
  validateAuthenticatorBase(parsed.rpIdHash, parsed.flags);

  if (
    input.previousSignCount > 0 &&
    parsed.signCount > 0 &&
    parsed.signCount <= input.previousSignCount
  ) {
    throw new Error("서명 카운터가 증가하지 않아 복제된 인증기 가능성이 있습니다.");
  }

  const clientDataHash = sha256Bytes(clientDataBytes);
  const signedData = new Uint8Array(authenticatorData.length + clientDataHash.length);
  signedData.set(authenticatorData, 0);
  signedData.set(clientDataHash, authenticatorData.length);

  const publicKey = await subtle.importKey(
    "jwk",
    input.publicKeyJwk,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["verify"],
  );

  const rawSignature = derEcdsaToRaw(fromBase64Url(input.signature));
  const verified = await subtle.verify(
    { name: "ECDSA", hash: "SHA-256" },
    publicKey,
    rawSignature,
    signedData,
  );

  if (!verified) throw new Error("패스키 서명 검증에 실패했습니다.");

  return { signCount: parsed.signCount };
}
