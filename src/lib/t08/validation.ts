export function normalizeUsername(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const username = value.trim().toLowerCase();
  return /^[a-z0-9_-]{3,24}$/.test(username) ? username : null;
}

export function normalizeDisplayName(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const displayName = value.trim();
  if (displayName.length < 1 || displayName.length > 40) return null;
  return displayName;
}

export function normalizePasskeyLabel(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const label = value.trim();
  if (label.length < 1 || label.length > 40) return null;
  return label;
}

export function isUuid(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
  );
}
