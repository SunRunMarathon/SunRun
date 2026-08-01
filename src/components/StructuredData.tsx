// Dane strukturalne (JSON-LD, schema.org) — pomagają Google zrozumieć, że to
// charytatywny bieg / wydarzenie sportowe w Lublinie i powiązać stronę z zapytaniami
// o bieganie, maratony, sport w Lublinie, bieg charytatywny i hospicjum.
// Renderowane server-side w <head>, więc trafia do statycznego HTML (widoczne dla botów).

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://sunrun.pl";

// Współrzędne i kod pocztowy zweryfikowane w OpenStreetMap/Nominatim —
// poprzednia wersja wskazywała punkt ok. 1,3 km na północ od faktycznego
// Parku Ludowego (i błędny kod pocztowy centrum zamiast Za Cukrownią/Piaski).
const PARK_LUDOWY_PLACE = {
  "@type": "Place",
  name: "Park Ludowy w Lublinie",
  address: {
    "@type": "PostalAddress",
    streetAddress: "al. Józefa Piłsudskiego",
    addressLocality: "Lublin",
    addressRegion: "Lubelskie",
    postalCode: "20-407",
    addressCountry: "PL",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 51.2359,
    longitude: 22.5601,
  },
};

const organization = {
  "@type": ["NGO", "SportsOrganization"],
  "@id": `${SITE_URL}/#organization`,
  name: "Sun Run Lublin",
  alternateName: "Sun Run",
  url: SITE_URL,
  logo: `${SITE_URL}/og-image.png`,
  image: `${SITE_URL}/og-image.png`,
  email: "hospicjum.samarytanin.bieg@gmail.com",
  foundingDate: "2025",
  description:
    "Bieg charytatywny w 100% organizowany przez lubelską młodzież na rzecz Hospicjum Dobrego Samarytanina w Lublinie. Bieganie, sport i pomoc w jednym.",
  areaServed: { "@type": "City", name: "Lublin" },
  location: PARK_LUDOWY_PLACE,
  knowsAbout: [
    "bieganie",
    "bieg charytatywny",
    "maraton",
    "bieg na 5 km",
    "sport w Lublinie",
    "wydarzenia biegowe",
    "wolontariat",
    "Hospicjum Dobrego Samarytanina",
  ],
  sameAs: [
    "https://www.instagram.com/sunrun.lublin/",
    "https://www.facebook.com/sun.run.charytatywny/",
    "https://www.tiktok.com/@sun.run_",
  ],
};

const website = {
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: "Sun Run Lublin",
  description:
    "Charytatywny bieg w Lublinie na rzecz Hospicjum Dobrego Samarytanina — bieganie, sport i pomoc.",
  inLanguage: "pl-PL",
  publisher: { "@id": `${SITE_URL}/#organization` },
};

// Data i godzina potwierdzone przez sztab: 12 września 2026.
// UWAGA: to obiekt SportsEvent, czyli sam BIEG — startDate musi wskazywać start
// biegu (18:30), a nie otwarcie festiwalu (16:00). Godzina 16:00 opisuje festiwal
// jako całość i należy do przyszłej sekcji o Festiwalu.
const event2026 = {
  "@type": "SportsEvent",
  "@id": `${SITE_URL}/#event-2026`,
  name: "Sun Run 2026 — Bieg Charytatywny w Lublinie",
  description:
    "II edycja charytatywnego biegu na 5 km (2 pętle) w Parku Ludowym w Lublinie. Bieg i Nordic Walking na rzecz Hospicjum Dobrego Samarytanina. Otwarte dla wszystkich od 14. roku życia.",
  sport: "Bieganie",
  startDate: "2026-09-12T18:30:00+02:00",
  eventStatus: "https://schema.org/EventScheduled",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  image: [`${SITE_URL}/og-image.png`],
  location: PARK_LUDOWY_PLACE,
  organizer: { "@id": `${SITE_URL}/#organization` },
  url: SITE_URL,
  // Ceny pakietów 2026 nie są jeszcze potwierdzone (patrz placeholder
  // "[DATA 2026]" w src/components/sections/pricing.tsx) — offers celowo
  // bez price/priceCurrency, żeby nie publikować zmyślonej ceny w wynikach
  // wyszukiwania. Dodaj price/priceCurrency tutaj, gdy sztab potwierdzi stawki.
  offers: {
    "@type": "Offer",
    url: "https://frslublin.pl/pl/app/races/sign_up_form/295",
    availability: "https://schema.org/InStock",
    validFrom: "2026-01-01T00:00:00+01:00",
  },
};

const event2025 = {
  "@type": "SportsEvent",
  "@id": `${SITE_URL}/#event-2025`,
  name: "Sun Run 2025 — I Bieg Charytatywny w Lublinie",
  description:
    "I edycja charytatywnego biegu na 5 km w Parku Ludowym w Lublinie — ponad 350 uczestników na rzecz Hospicjum Dobrego Samarytanina.",
  sport: "Bieganie",
  startDate: "2025-09-06T09:00:00+02:00",
  endDate: "2025-09-06T12:00:00+02:00",
  eventStatus: "https://schema.org/EventScheduled",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  location: PARK_LUDOWY_PLACE,
  organizer: { "@id": `${SITE_URL}/#organization` },
  url: `${SITE_URL}/archiwum`,
};

const graph = {
  "@context": "https://schema.org",
  "@graph": [organization, website, event2026, event2025],
};

export function StructuredData() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
