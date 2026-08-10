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
            (np. media społecznościowe, od znajomego, z ulotki, telewizja), przy wyborze „media
            społecznościowe" dodatkowo doprecyzowanie (np. TikTok, Instagram, Facebook), a przy
            wyborze „Inne" na dowolnym poziomie - opcjonalny, dowolny tekst wpisany przez Ciebie.
            To pole jest wolnym tekstem, więc jeśli sam(a) wpiszesz w nim dane osobowe (np. swoje
            imię i nazwisko), zostaną one zapisane razem z resztą odpowiedzi.
          </li>
          <li>
            <strong>Adres IP oraz przybliżona lokalizacja</strong> (miasto, region, kraj) ustalona
            na podstawie adresu IP - przy wypełnieniu ankiety.
          </li>
          <li>
            <strong>Adres IP bez geolokalizacji</strong> - osobno, przy każdym wejściu na stronę
            główną, ale dopiero po wyrażeniu zgody na analitykę w banerze cookies (ten sam licznik,
            który liczy też wskaźnik „wejścia / wypełnienia ankiety" w panelu administracyjnym).
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
          cookies, w celu analizy ruchu na stronie. Google przetwarza dane w infrastrukturze
          obejmującej serwery poza Europejskim Obszarem Gospodarczym, w tym w USA. Transfer odbywa
          się na podstawie mechanizmów przewidzianych przez RODO (m.in. ramy Data Privacy
          Framework UE-USA lub standardowe klauzule umowne Google) - szczegóły w polityce
          prywatności Google.
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
          <li>przenoszenia danych (otrzymania ich w ustrukturyzowanym, powszechnie używanym formacie),</li>
          <li>wniesienia sprzeciwu wobec przetwarzania,</li>
          <li>
            cofnięcia zgody w dowolnym momencie (bez wpływu na zgodność z prawem przetwarzania
            sprzed cofnięcia) - zgodę na analitykę możesz wycofać jednym kliknięciem w stopce
            strony („Zarządzaj zgodą"), bez grzebania w ustawieniach przeglądarki,
          </li>
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
      <>
        <p>
          Strona korzysta z plików cookie Google Analytics wyłącznie po wyrażeniu zgody w banerze
          wyświetlanym przy pierwszej wizycie. Zgodę możesz w każdej chwili wycofać linkiem
          „Zarządzaj zgodą" w stopce strony - baner pojawi się ponownie od razu, na tej samej
          stronie, bez konieczności czyszczenia czegokolwiek w ustawieniach przeglądarki.
        </p>
        <div className="overflow-x-auto mt-3">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left border-b border-sr-line">
                <th className="py-2 pr-4 font-bold">Nazwa</th>
                <th className="py-2 pr-4 font-bold">Cel</th>
                <th className="py-2 pr-4 font-bold">Czas życia</th>
                <th className="py-2 font-bold">Kto ustawia</th>
              </tr>
            </thead>
            <tbody className="text-[#3D4D65]">
              <tr className="border-b border-sr-line/60">
                <td className="py-2 pr-4 font-mono text-xs">_ga</td>
                <td className="py-2 pr-4">Rozróżnianie unikalnych użytkowników w Google Analytics</td>
                <td className="py-2 pr-4">2 lata</td>
                <td className="py-2">Google (zewnętrzny), po zgodzie</td>
              </tr>
              <tr className="border-b border-sr-line/60">
                <td className="py-2 pr-4 font-mono text-xs">_ga_&lt;identyfikator&gt;</td>
                <td className="py-2 pr-4">Utrzymanie stanu sesji w Google Analytics 4</td>
                <td className="py-2 pr-4">2 lata</td>
                <td className="py-2">Google (zewnętrzny), po zgodzie</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-mono text-xs">sr_consent_analytics i in.</td>
                <td className="py-2 pr-4">
                  Zapamiętanie Twojego wyboru w banerze zgody oraz techniczne działanie strony
                  (np. żeby ankieta nie pokazała się drugi raz) - localStorage, nie cookie w
                  ścisłym sensie
                </td>
                <td className="py-2 pr-4">bezterminowo, do wyczyszczenia danych strony</td>
                <td className="py-2">Ta strona (własne, techniczne)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </>
    ),
  },
  {
    title: "9. Zapisy przez zewnętrzny serwis FRS",
    body: (
      <p>
        Przycisk „Zapisz się" prowadzi do formularza rejestracji w systemie FRS
        (frslublin.pl) - to osobny serwis, niezależny od tej strony. Dane podane w
        formularzu zapisów (np. imię, nazwisko, data urodzenia, dane do kontaktu) trafiają
        bezpośrednio do FRS i podlegają jego własnej polityce prywatności, a nie niniejszemu
        dokumentowi - nie mamy wglądu w te dane ani kontroli nad ich przetwarzaniem.
      </p>
    ),
  },
];

export default function PolitykaPrywatnosciPage() {
  return (
    <div className="relative min-h-screen bg-sr-sand text-sr-navy overflow-x-hidden">
      <Navbar />

      <main className="relative z-10 px-6 sm:px-12 md:px-20 pt-28 pb-20 max-w-3xl mx-auto">
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
