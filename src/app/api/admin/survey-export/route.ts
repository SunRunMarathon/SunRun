import { queryWithRetry } from "@/lib/db";
import { isAuthorizedRequest } from "@/lib/admin-session";

// Eksport SUROWYCH danych ankiety - to jest wysyp adresow IP i przyblizonych
// lokalizacji realnych ludzi jednym zadaniem, wiec chronione TA SAMA sesja
// administratora co reszta /admin (isAuthorizedRequest - identyczny straznik
// co GET /api/survey). Brak sesji = 401, sprawdzone w praktyce (patrz raport).
//
// Kolumny 1:1 z survey_responses - "komplet pol" ze zlecenia: odpowiedz
// glowna, doprecyzowanie kanalu social, wolny tekst "Inne", IP, geolokalizacja
// (miasto/region/kraj), zrodlo ruchu + UTM-y, urzadzenie (typ + user-agent),
// znacznik czasu, strona wejscia, plus referrer i id jako naturalny klucz -
// to wszystko, co i tak juz widac w tabeli surowych odpowiedzi w /admin,
// tylko w formie do pobrania zamiast przewijania.
const COLUMNS = [
  "id",
  "created_at",
  "answer",
  "answer_detail",
  "other_text",
  "ip",
  "city",
  "region",
  "country",
  "referrer",
  "traffic_source",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "user_agent",
  "device_type",
  "landing_path",
] as const;

const BATCH_SIZE = 500;

function timestampForFilename(): string {
  // 2026-08-01T14-05-30 - dwukropki wywalone, bo niektore systemy plikow
  // (Windows) ich nie lubia w nazwie.
  return new Date().toISOString().replace(/:/g, "-").replace(/\..+/, "");
}

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = value instanceof Date ? value.toISOString() : String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// Pobiera wiersze partiami (OFFSET/LIMIT po stalym ORDER BY) zamiast jednym
// zapytaniem na cala tabele - przy kilku tysiacach rekordow to nadal jedno-
// -cyfrowa liczba zapytan, ale strumien zaczyna wysylac dane do przegladarki
// natychmiast po pierwszej partii, a nie dopiero po zbudowaniu calosci w
// pamieci. ORDER BY created_at DESC, id DESC jest deterministyczny, wiec
// kolejne strony OFFSET-a nie gubia/dublują wierszy, dopoki nikt nic nie
// usuwa w trakcie eksportu (jednorazowa akcja administratora - pomijalne
// ryzyko).
async function* fetchRowsInBatches() {
  let offset = 0;
  for (;;) {
    const result = await queryWithRetry<Record<string, unknown>>(
      `SELECT ${COLUMNS.join(", ")} FROM survey_responses
       ORDER BY created_at DESC, id DESC
       LIMIT $1 OFFSET $2`,
      [BATCH_SIZE, offset]
    );
    if (result.rows.length === 0) return;
    yield result.rows;
    if (result.rows.length < BATCH_SIZE) return;
    offset += BATCH_SIZE;
  }
}

function buildJsonStream(): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const rowsIterator = fetchRowsInBatches();
  let first = true;

  return new ReadableStream({
    async start(controller) {
      controller.enqueue(encoder.encode("["));
    },
    async pull(controller) {
      const { value: batch, done } = await rowsIterator.next();
      if (done) {
        controller.enqueue(encoder.encode("]"));
        controller.close();
        return;
      }
      let chunk = "";
      for (const row of batch) {
        chunk += (first ? "" : ",") + "\n" + JSON.stringify(row);
        first = false;
      }
      controller.enqueue(encoder.encode(chunk));
    },
  });
}

function buildCsvStream(): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const rowsIterator = fetchRowsInBatches();

  return new ReadableStream({
    async start(controller) {
      controller.enqueue(encoder.encode(COLUMNS.join(",") + "\r\n"));
    },
    async pull(controller) {
      const { value: batch, done } = await rowsIterator.next();
      if (done) {
        controller.close();
        return;
      }
      let chunk = "";
      for (const row of batch) {
        chunk += COLUMNS.map((c) => csvEscape(row[c])).join(",") + "\r\n";
      }
      controller.enqueue(encoder.encode(chunk));
    },
  });
}

export async function GET(request: Request) {
  if (!isAuthorizedRequest(request)) {
    return Response.json({ error: "Brak autoryzacji" }, { status: 401 });
  }

  const url = new URL(request.url);
  const format = url.searchParams.get("format") === "csv" ? "csv" : "json";
  const filename = `ankieta-sun-run-${timestampForFilename()}.${format}`;

  try {
    const stream = format === "csv" ? buildCsvStream() : buildJsonStream();
    return new Response(stream, {
      headers: {
        "Content-Type": format === "csv" ? "text/csv; charset=utf-8" : "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error("[survey-export] Eksport nieudany:", err);
    return Response.json({ error: "Błąd serwera" }, { status: 500 });
  }
}
