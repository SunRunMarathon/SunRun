// Parsowanie metadanych żądania (IP, urządzenie, źródło ruchu) współdzielone
// przez API ankiety i licznika wejść.

export function getClientIp(request: Request): string | null {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const xri = request.headers.get("x-real-ip");
  if (xri) return xri.trim();
  return null;
}

export function detectDeviceType(userAgent: string): "mobile" | "tablet" | "desktop" {
  const ua = userAgent.toLowerCase();
  if (/ipad|tablet|(android(?!.*mobile))/.test(ua)) return "tablet";
  if (/mobi|iphone|android|ipod/.test(ua)) return "mobile";
  return "desktop";
}

// Hosty social/wyszukiwarek rozpoznawane po domenie referrera, gdy nie ma UTM-ów.
const HOST_SOURCE_MAP: [pattern: string, source: string][] = [
  ["google.", "google"],
  ["bing.", "bing"],
  ["duckduckgo.", "duckduckgo"],
  ["yahoo.", "yahoo"],
  ["instagram.com", "instagram"],
  ["facebook.com", "facebook"],
  ["fb.com", "facebook"],
  ["l.facebook.com", "facebook"],
  ["lm.facebook.com", "facebook"],
  ["tiktok.com", "tiktok"],
  ["t.co", "twitter"],
  ["twitter.com", "twitter"],
  ["x.com", "twitter"],
  ["youtube.com", "youtube"],
];

export function detectTrafficSource(params: {
  utmSource?: string | null;
  referrer?: string | null;
}): string {
  const { utmSource, referrer } = params;
  if (utmSource) return utmSource.toLowerCase().trim();
  if (!referrer) return "direct";

  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "");
    for (const [pattern, source] of HOST_SOURCE_MAP) {
      if (host.includes(pattern)) return source;
    }
    return host || "unknown";
  } catch {
    return "unknown";
  }
}
