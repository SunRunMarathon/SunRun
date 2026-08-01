// Geolokalizacja po adresie IP (ip-api.com, darmowy plan, bez klucza).
// Błąd/timeout nigdy nie może wywalić zapisu ankiety — zawsze zwracamy
// obiekt z nullami zamiast rzucać wyjątek.

export type GeoResult = {
  city: string | null;
  region: string | null;
  country: string | null;
};

const EMPTY_GEO: GeoResult = { city: null, region: null, country: null };

// Adresy prywatne/loopback nie mają sensu do geolokalizacji (np. lokalny dev).
const PRIVATE_IP_RE = /^(::1|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/;

export async function lookupGeoIp(ip: string | null): Promise<GeoResult> {
  if (!ip || PRIVATE_IP_RE.test(ip)) return EMPTY_GEO;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);

  try {
    const res = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,city,regionName,country`,
      { signal: controller.signal }
    );
    if (!res.ok) return EMPTY_GEO;
    const data = await res.json();
    if (data.status !== "success") return EMPTY_GEO;
    return {
      city: data.city ?? null,
      region: data.regionName ?? null,
      country: data.country ?? null,
    };
  } catch {
    return EMPTY_GEO;
  } finally {
    clearTimeout(timeout);
  }
}
