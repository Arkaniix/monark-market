// Centralized marketplace platform configuration + normalization

export type PlatformKey = "leboncoin" | "ebay" | "ldlc" | "facebook" | "vinted";

export const MARKETPLACE_PLATFORMS: Array<{ value: PlatformKey; label: string }> = [
  { value: "leboncoin", label: "Leboncoin" },
  { value: "ebay", label: "eBay" },
  { value: "facebook", label: "Facebook Marketplace" },
  { value: "vinted", label: "Vinted" },
  { value: "ldlc", label: "LDLC Occasion" },
];

/**
 * Converts any platform label/value to our canonical key.
 * Examples:
 * - "LDLC Occasion" -> "ldlc"
 * - "fb-marketplace" / "FB Marketplace" -> "facebook"
 */
export function normalizePlatformKey(input?: string | null): PlatformKey | "" {
  if (!input) return "";

  const raw = String(input).trim();
  if (!raw) return "";

  // Already canonical?
  const direct = raw.toLowerCase() as PlatformKey;
  if (
    direct === "leboncoin" ||
    direct === "ebay" ||
    direct === "ldlc" ||
    direct === "facebook" ||
    direct === "vinted"
  ) {
    return direct;
  }

  const normalized = raw
    .toLowerCase()
    .replace(/marketplace/g, "")
    .replace(/[\s_-]+/g, "")
    .trim();

  if (normalized === "lbc" || normalized.includes("leboncoin")) return "leboncoin";
  if (normalized.includes("ebay")) return "ebay";
  if (normalized === "fb" || normalized.startsWith("fb") || normalized.includes("facebook")) return "facebook";
  if (normalized.includes("vinted")) return "vinted";
  if (normalized.includes("ldlc")) return "ldlc";

  return "";
}
