import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Polityka prywatności",
  description:
    "Polityka prywatności Sun Run Lublin - jakie dane zbieramy (ankieta, IP, geolokalizacja, Google Analytics), w jakim celu i jakie masz prawa.",
  alternates: { canonical: "/polityka-prywatnosci" },
  robots: { index: true, follow: true },
};

// Sekcje trzymane jako dane, żeby treść była łatwa do przejrzenia i
// aktualizacji bez grzebania w JSX każdej sekcji z osobna.
const SECTIONS: { title: string; body: React.ReactNode }[] = [
  {
    // Administratorami sa dwie osoby fizyczne ze sztabu (wspoladministrowanie,
    // art. 26 RODO) - hospicjum jeszcze NIE potwierdzilo, czy ma figurowac w
    // tej roli (patrz poprzednia wersja tego pliku / raport), wiec na razie
    // go tu nie ma. Hospicjum zostaje gdzie indziej na stronie jako
    // BENEFICJENT zbiorki - to inna rola i nie wolno ich mieszac.
    //
    // Adresy zamieszkania administratorow CELOWO nie sa tu podane - Milosz
    // zdecydowal, ze na razie tylko kontakt mailowy wystarcza (RODO art. 13
    // wymaga tozsamosci i danych KONTAKTOWYCH, nie koniecznie adresu
    // zamieszkania, a raz opublikowany adres domowy trafia do wyszukiwarek
    // i archiwow bezpowrotnie). Gdyby zdecydowal inaczej, dopisanie adresu to
    // jedna zmiana - PLACEHOLDER ponizej pokazuje gdzie.
    title: "1. Administrator danych",
    body: (
      <>
        <p>
          Administratorami danych osobowych zbieranych przez tę stronę są (współadministrowanie
          w rozumieniu art. 26 RODO):
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            <strong>Miłosz Kamiński</strong> - kontakt:{" "}
            <a href="mailto:miloszzkamm@gmail.com" className="underline hover:text-sr-orange">
              miloszzkamm@gmail.com
            </a>
            {/* PLACEHOLDER: adres zamieszkania - dopisz tutaj tylko po wyraznej
                decyzji Milosza, w formacie: ", zamieszkały pod adresem [ulica,
                kod pocztowy, miejscowość]". Do tego czasu zostaje tak jak jest. */}
          </li>
          <li>
            <strong>Michał Żaba</strong> - kontakt:{" "}
            <a href="mailto:michal.zaba4@wp.pl" className="underline hover:text-sr-orange">
              michal.zaba4@wp.pl
            </a>
          </li>
        </ul>
        <p>
          Zgodnie z uzgodnieniem między współadministratorami, w sprawach związanych z ochroną
          danych osobowych (dostęp, sprostowanie, usunięcie i pozostałe prawa opisane w sekcji 7)
          napisz na adres:{" "}
          <a href="mailto:miloszzkamm@gmail.com" className="underline hover:text-sr-orange">
            miloszzkamm@gmail.com
          </a>
          .
        </p>
      </>
    ),
  },
  {
    title: "2. Jakie dane zbieramy",
    body: (
      <>
        <p>Zbieramy następujące kategorie danych:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            <strong>Odpowiedź w ankiecie „Skąd się o nas dowiedziałeś?"</strong> - wybrana opcja
            (np. media społecznościowe, od znajomego, z ulotki).
          </li>
          <li>
            <strong>Adres IP oraz przybliżona lokalizacja</strong> (miasto, region, kraj) ustalona
            na podstawie adresu IP w momencie wypełnienia ankiety.
          </li>
          <li>
            <strong>Źródło ruchu</strong> - informacja, skąd trafiłeś na stronę: wyszukiwarka
            (np. Google), media społecznościowe (Instagram, Facebook, TikTok), konkretna kampania
            lub post (parametry UTM w adresie URL) albo wejście bezpośrednie.
          </li>
          <li>
            <strong>Dane techniczne</strong> - typ przeglądarki i urządzenia (user agent), rodzaj
            urządzenia (telefon / tablet / komputer), znacznik czasu oraz podstrona, na którą
            trafiłeś (ścieżka wejścia).
          </li>
          <li>
            <strong>Dane z Google Analytics</strong> (pliki cookie) - wyłącznie po wyrażeniu zgody
            w banerze cookies: statystyki odwiedzin, czas spędzony na stronie, przewijanie strony,
            kliknięcia w wybrane elementy, ścieżka nawigacji między podstronami.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "3. Cel przetwarzania",
    body: (
      <p>
        Dane wykorzystujemy wyłącznie do celów statystycznych i organizacyjnych: żeby zrozumieć,
        skąd dowiadują się o nas uczestnicy, ocenić skuteczność promocji (media społecznościowe,
        ulotki, poczta pantoflowa) oraz poprawiać działanie strony. Nie sprzedajemy ani nie
        udostępniamy tych danych podmiotom trzecim w celach marketingowych.
      </p>
    ),
  },
  {
    title: "4. Podstawa prawna",
    body: (
      <ul className="list-disc pl-5 space-y-1.5">
        <li>
          Art. 6 ust. 1 lit. a) RODO - <strong>zgoda</strong>: dla odpowiedzi w ankiecie (wyrażana
          przez wybranie opcji) oraz dla plików cookie Google Analytics (wyrażana w banerze
          zgody).
        </li>
        <li>
          Art. 6 ust. 1 lit. f) RODO - <strong>prawnie uzasadniony interes</strong> administratora:
          podstawowe logi techniczne (np. adres IP) niezbędne do zabezpieczenia i utrzymania
          strony.
        </li>
      </ul>
    ),
  },
  {
    title: "5. Jak długo przechowujemy dane",
    body: (
      <p>
        Dane z ankiety i statystyki wewnętrzne przechowujemy nie dłużej niż 24 miesiące od
        zakończenia danej edycji Sun Run, po czym są usuwane lub anonimizowane. Dane w Google
        Analytics przechowywane są zgodnie z ustawieniami retencji Google (domyślnie do 14
        miesięcy) i podlegają odrębnej polityce prywatności Google.
      </p>
    ),
  },
  {
    title: "6. Odbiorcy danych",
    body: (
      <ul className="list-disc pl-5 space-y-1.5">
        <li>
          Dostawca hostingu i bazy danych: Railway Corporation - przechowuje dane serwisu i bazę
          danych na potrzeby jego działania.
        </li>
        <li>
          Google Ireland Limited (Google Analytics) - wyłącznie po wyrażeniu zgody w banerze
          cookies, w celu analizy ruchu na stronie.
        </li>
      </ul>
    ),
  },
  {
    title: "7. Twoje prawa",
    body: (
      <>
        <p>Zgodnie z RODO przysługuje Ci prawo do:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>dostępu do swoich danych i uzyskania ich kopii,</li>
          <li>sprostowania (poprawienia) danych,</li>
          <li>usunięcia danych („prawo do bycia zapomnianym"),</li>
          <li>ograniczenia przetwarzania,</li>
          <li>wniesienia sprzeciwu wobec przetwarzania,</li>
          <li>cofnięcia zgody w dowolnym momencie (bez wpływu na zgodność z prawem przetwarzania sprzed cofnięcia),</li>
          <li>wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych (UODO).</li>
        </ul>
        <p className="mt-3">
          Aby skorzystać z tych praw, napisz na{" "}
          <a href="mailto:miloszzkamm@gmail.com" className="underline hover:text-sr-orange">
            miloszzkamm@gmail.com
          </a>
          .
        </p>
      </>
    ),
  },
  {
    title: "8. Pliki cookie",
    body: (
      <p>
        Strona korzysta z plików cookie Google Analytics wyłącznie po wyrażeniu zgody w banerze
        wyświetlanym przy pierwszej wizycie. Możesz w każdej chwili cofnąć zgodę, czyszcząc dane
        strony w ustawieniach przeglądarki - baner pojawi się ponownie przy kolejnej wizycie.
      </p>
    ),
  },
];

export default function PolitykaPrywatnosciPage() {
  return (
    <div className="relative min-h-screen bg-sr-sand text-sr-navy overflow-x-hidden">
      <Navbar />

      <main className="relative z-10 px-6 sm:px-12 md:px-20 pt-28 pb-20 max-w-3xl mx-auto">
        <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] text-sr-red px-3 py-1.5 bg-sr-red/10 rounded-full border border-sr-red/30 mb-6">
          RODO
        </span>
        <h1 className="text-4xl sm:text-5xl font-black uppercase text-[#183153] leading-tight mb-3">
          Polityka prywatności
        </h1>
        <p className="text-sm text-[#3D4D65] mb-12">Ostatnia aktualizacja: sierpień 2026</p>

        <div className="space-y-10">
          {SECTIONS.map((s) => (
            <section key={s.title} className="space-y-3">
              <h2 className="text-xl font-black text-[#183153]">{s.title}</h2>
              <div className="text-sm sm:text-base text-[#183153] leading-relaxed space-y-3">
                {s.body}
              </div>
            </section>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
