const VISITOR_ID_KEY = "sr_visitor_id";

// Trwały identyfikator przeglądarki — zwykły losowy UUID w localStorage, bez
// żadnych danych osobowych. Inaczej niż client_token w tabelach (survey,
// interaction_clicks, share_clicks): ten jest generowany świeżo przy KAŻDYM
// requeście wyłącznie do deduplikacji zapisu, więc nie nadaje się do
// łączenia zdarzeń jednej osoby. Ten identyfikator zostaje w przeglądarce, co
// pozwala połączyć odpowiedź w ankiecie z późniejszym kliknięciem
// "Zapisz się" tej samej osoby (patrz /admin, panel "Ankieta").
export function getVisitorId(): string {
  if (typeof window === "undefined") return "";
  let id = window.localStorage.getItem(VISITOR_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(VISITOR_ID_KEY, id);
  }
  return id;
}
