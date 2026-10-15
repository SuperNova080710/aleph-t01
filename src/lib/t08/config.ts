function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} 환경 변수가 필요합니다.`);
  }
  return value;
}

function getSupabaseServerKey() {
  const secretKey = process.env.SUPABASE_SECRET_KEY?.trim();
  if (secretKey) {
    return {
      value: secretKey,
      type: "secret" as const,
    };
  }

  const legacyServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (legacyServiceRoleKey) {
    return {
      value: legacyServiceRoleKey,
      type: "legacy-service-role" as const,
    };
  }

  throw new Error(
    "SUPABASE_SECRET_KEY 환경 변수가 필요합니다. legacy 프로젝트는 SUPABASE_SERVICE_ROLE_KEY를 임시로 사용할 수 있습니다.",
  );
}

export function getT08Config() {
  const supabaseServerKey = getSupabaseServerKey();

  return {
    supabaseUrl: required("SUPABASE_URL").replace(/\/$/, ""),
    supabaseApiKey: supabaseServerKey.value,
    supabaseKeyType: supabaseServerKey.type,
    rpId: required("WEBAUTHN_RP_ID"),
    origin: required("WEBAUTHN_ORIGIN").replace(/\/$/, ""),
    rpName: process.env.WEBAUTHN_RP_NAME?.trim() || "Odyz Developer Profile",
  };
}
