// Metadane zbierane po stronie klienta i wysyłane do /api/survey oraz
// /api/visit — UTM-y i referrer trzeba odczytać w przeglądarce, serwer ich
// nie widzi.

export type ClientMeta = {
  referrer: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
  landingPath: string;
};

export function collectClientMeta(): ClientMeta {
  const params = new URLSearchParams(window.location.search);
  return {
    referrer: document.referrer || null,
    utmSource: params.get("utm_source"),
    utmMedium: params.get("utm_medium"),
    utmCampaign: params.get("utm_campaign"),
    utmContent: params.get("utm_content"),
    utmTerm: params.get("utm_term"),
    landingPath: window.location.pathname,
  };
}
