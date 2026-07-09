/** Trimmed string from FormData, or null when blank/missing. */
export function formStr(formData: FormData, key: string): string | null {
  const v = formData.get(key);
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  return trimmed === "" ? null : trimmed;
}

/** Numeric value from FormData, falling back when blank/invalid. */
export function formNum(formData: FormData, key: string, fallback = 0): number {
  const v = formData.get(key);
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}
