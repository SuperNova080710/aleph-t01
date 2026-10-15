function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} 환경 변수가 필요합니다.`);
  }
  return value;
}

export function getT08Config() {
  return {
    supabaseUrl: required("SUPABASE_URL").replace(/\/$/, ""),
    supabaseServiceRoleKey: required("SUPABASE_SERVICE_ROLE_KEY"),
    rpId: required("WEBAUTHN_RP_ID"),
    origin: required("WEBAUTHN_ORIGIN").replace(/\/$/, ""),
    rpName: process.env.WEBAUTHN_RP_NAME?.trim() || "Odyz Developer Profile",
  };
}
