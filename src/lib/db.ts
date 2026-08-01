import { Pool, type QueryResult, type QueryResultRow } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  max: 10,
  // Postgres na darmowym planie Railway usypia po bezczynności - polaczenia
  // trzymane zbyt dlugo w puli i tak przestana dzialac, wiec krotszy
  // idleTimeout zmniejsza szanse na uzycie juz martwego polaczenia.
  idleTimeoutMillis: 30_000,
  // Ile czeka POJEDYNCZA proba na nawiazanie polaczenia, zanim odpusci -
  // budzenie usypianego Postgresa trwa realnie kilka-kilkanascie sekund,
  // wiec ponizej tego czasu retry (patrz queryWithRetry) ma sens szybciej
  // niz jedno dlugie oczekiwanie.
  connectionTimeoutMillis: 8_000,
  // Timeout samego zapytania po nawiazaniu polaczenia - chroni przed
  // polaczeniem, ktore "wstalo", ale wciaz nie odpowiada.
  query_timeout: 10_000,
  keepAlive: true,
});

// Bez tego handlera nieoczekiwany blad na BEZCZYNNYM polaczeniu w puli (np.
// serwer usypia je w trakcie uspania Postgresa) jest nieobsluzonym wyjatkiem
// i wywala caly proces Node - to udokumentowana pulapka node-postgres, nie
// hipoteza. Samo zalogowanie + odrzucenie tego polaczenia z puli wystarczy,
// kolejne zapytanie po prostu otworzy nowe.
pool.on("error", (err) => {
  console.error("[db] Nieoczekiwany błąd na bezczynnym połączeniu z bazą:", err);
});

// Bledy, dla ktorych warto ponowic zapytanie - wylacznie problemy z samym
// POLACZENIEM (siec, usypiajacy/budzacy sie Postgres). Bledy samego zapytania
// (skladnia, naruszenie ograniczen, brak tabeli) NIE sa tutaj celowo -
// ponawianie zlego SQL tylko dokleja opoznienie bez szans na sukces.
const RETRYABLE_NETWORK_CODES = new Set([
  "ECONNRESET",
  "ECONNREFUSED",
  "ETIMEDOUT",
  "EHOSTUNREACH",
  "EPIPE",
  "EAI_AGAIN",
]);

// Kody SQLSTATE Postgresa oznaczajace chwilowa niedostepnosc serwera, a nie
// wadliwe zapytanie - "57P03" to dokladnie ten blad, ktory rzuca usypiany
// Postgres Railway w trakcie budzenia ("the database system is starting up").
const RETRYABLE_PG_CODES = new Set([
  "57P03", // cannot_connect_now (baza sie uruchamia)
  "57P01", // admin_shutdown
  "53300", // too_many_connections
  "08000", // connection_exception
  "08003", // connection_does_not_exist
  "08006", // connection_failure
  "08001", // sqlclient_unable_to_establish_sqlconnection
  "08004", // sqlserver_rejected_establishment_of_sqlconnection
]);

function isRetryableError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const code = (err as { code?: string }).code;
  if (code && (RETRYABLE_NETWORK_CODES.has(code) || RETRYABLE_PG_CODES.has(code))) return true;
  const message = (err as { message?: string }).message || "";
  return message.includes("Connection terminated unexpectedly");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const RETRY_DELAYS_MS = [300, 900, 2100];

// Wrapper na pool.query, ktory ponawia PROBE POLACZENIA (nie samo zapytanie w
// sensie logicznym - parametry sa identyczne przy kazdej probie) z rosnacym
// opoznieniem, wylacznie dla bledow z listy powyzej. Kazdy inny blad (np. zle
// SQL) leci od razu do wywolujacego, bez zadnej zwloki.
export async function queryWithRetry<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[],
  maxAttempts = RETRY_DELAYS_MS.length + 1
): Promise<QueryResult<T>> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await pool.query<T>(text, params as unknown[]);
    } catch (err) {
      lastErr = err;
      const isLastAttempt = attempt === maxAttempts - 1;
      if (!isRetryableError(err) || isLastAttempt) throw err;
      const delay = RETRY_DELAYS_MS[attempt] ?? RETRY_DELAYS_MS[RETRY_DELAYS_MS.length - 1];
      console.warn(
        `[db] Zapytanie nieudane (błąd połączenia, próba ${attempt + 1}/${maxAttempts}), ponawiam za ${delay}ms:`,
        (err as Error).message
      );
      await sleep(delay);
    }
  }
  throw lastErr;
}

export default pool;
