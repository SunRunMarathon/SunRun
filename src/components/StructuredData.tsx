// Dane strukturalne (JSON-LD, schema.org) — pomagają Google zrozumieć, że to
// charytatywny bieg / wydarzenie sportowe w Lublinie i powiązać stronę z zapytaniami
// o bieganie, maratony, sport w Lublinie, bieg charytatywny i hospicjum.
// Renderowane server-side w <head>, więc trafia do statycznego HTML (widoczne dla botów).

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://sunrun.pl";

const PARK_LUDOWY_PLACE = {
  "@type": "Place",
  name: "Park Ludowy w Lublinie",
  address: {
    "@type": "PostalAddress",
    streetAddress: "al. Józefa Piłsudskiego",
    addressLocality: "Lublin",
    addressRegion: "Lubelskie",
    postalCode: "20-001",
    addressCountry: "PL",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 51.2478,
    longitude: 22.5508,
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

// UWAGA: startDate to PLACEHOLDER (wrzesień 2026) — zaktualizuj po potwierdzeniu daty
// II edycji. Bez poprawnej daty wydarzenie nie dostanie "rich resulta", ale i tak
// buduje powiązanie tematyczne z bieganiem/biegiem charytatywnym w Lublinie.
const event2026 = {
  "@type": "SportsEvent",
  "@id": `${SITE_URL}/#event-2026`,
  name: "Sun Run 2026 — Bieg Charytatywny w Lublinie",
  description:
    "II edycja charytatywnego biegu na 5 km (2 pętle) w Parku Ludowym w Lublinie. Bieg i Nordic Walking na rzecz Hospicjum Dobrego Samarytanina. Otwarte dla wszystkich od 14. roku życia.",
  sport: "Bieganie",
  startDate: "2026-09-05T09:00:00+02:00",
  eventStatus: "https://schema.org/EventScheduled",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  image: [`${SITE_URL}/og-image.png`],
  location: PARK_LUDOWY_PLACE,
  organizer: { "@id": `${SITE_URL}/#organization` },
  url: SITE_URL,
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
