"use client";

import { useState } from "react";
import { trackEvent } from "@/lib/analytics";

const EMPTY_FORM = { name: "", email: "", startNumber: "", invitedEmail: "" };

const KROKI = [
  {
    tytul: "Podajesz swoje dane",
    opis: "Twoje imię, e-mail i numer startowy, a także e-mail osoby przez ciebie zaproszonej. E-maile powinny pokrywać się z tymi użytymi do rejestracji w serwisie FRS.",
  },
  {
    tytul: "Sprawdzamy zgodność",
    opis: "Sprawdzimy, czy użytkownik o podanym e-mailu jest w naszej bazie uczestników oraz czy nikt wcześniej nie zadeklarował zaproszenia go.",
  },
  {
    tytul: "Otrzymujesz nagrody",
    opis: "W dniu biegu otrzymasz nagrody w formie gadżetów - ich rodzaj będzie zależał od twojego miejsca w rankingu zapraszających.",
  },
];

// Pelna wersja formularza - wczesniej byla to niewielka karta + modal na
// stronie glownej, ale modal potrafil renderowac sie POD pozniejszymi
// sekcjami (Wspomnienia/FAQ/Partnerzy), a sama karta byla zbyt maloczytelna
// jak na cos, co ma zachecac do udzialu. Osobna podstrona rozwiazuje oba
// problemy: nic jej nie przykrywa i jest miejsce na pelne wyjasnienie.
//
// Przycisk nie generuje juz linku ani nie wyswietla go do skopiowania/
// udostepnienia - patrz ReferralPanel.tsx / plan przebudowy calego systemu
// zaproszen. Sama funkcja wysylki (co dokladnie robimy z danymi na serwerze)
// zostanie dopiete w kolejnym kroku - to jest wylacznie warstwa formularza.
export function ReferralGenerator() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [sukces, setSukces] = useState(false);
  // Klucze juz wyslanych zaproszen w tej sesji (inviter + zaproszony), zeby
  // zablokowac wyslanie dwa razy TEGO SAMEGO zgloszenia - patrz handleSubmit.
  const [wyslaneKlucze, setWyslaneKlucze] = useState<string[]>([]);

  const set = (key: keyof typeof EMPTY_FORM) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setSukces(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError("");
    setSukces(false);

    // Duplikat liczony po parze e-maili (kto zaprasza + kogo), nie po calym
    // formularzu - to ta para decyduje, czy to "to samo zgloszenie", nawet
    // gdyby imie czy numer startowy zdazyly sie miedzyczasie zmienic.
    const klucz = `${form.email.trim().toLowerCase()}|${form.invitedEmail.trim().toLowerCase()}`;
    if (wyslaneKlucze.includes(klucz)) {
      setError("To zaproszenie zostało już wysłane.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/referral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}) as { error?: string });
        setError(data.error || "Nie udało się wysłać formularza");
        return;
      }
      trackEvent("referral_form_submitted", {});
      setWyslaneKlucze((k) => [...k, klucz]);
      // Czyścimy TYLKO e-mail zaproszonego - te same dane zapraszającego
      // (imię, e-mail, numer startowy) zostają, żeby można było od razu
      // wysłać kolejne zaproszenie dla innej osoby bez przepisywania ich.
      setForm((f) => ({ ...f, invitedEmail: "" }));
      setSukces(true);
    } catch {
      setError("Błąd połączenia z serwerem");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="relative z-10 w-full px-6 sm:px-12 pt-32 pb-24">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-sm font-bold uppercase tracking-[0.3em] text-sr-red mb-4 block">
            Zaproś znajomych
          </span>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-[#183153] mb-6 leading-tight">
            Biegnij razem ze znajomymi
          </h1>
          <p className="text-base sm:text-lg text-[#3D4D65] leading-relaxed max-w-2xl mx-auto">
            Masz już numer startowy? Dzięki tobie ktoś inny zapisał się na bieg? Znaczy to,
            że jesteś o krok od otrzymania gadżetów Sun Run! Wypełnij poniższy formularz, a w dniu
            biegu będziesz mógł odebrać swój prezent. Dla TOP 10 zapraszających przewidziane są
            specjalne Mystery Boxy Sun Run.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 mb-12">
          {KROKI.map((k, i) => (
            <div key={k.tytul} className="bg-sr-white border border-sr-line rounded-2xl p-5">
              <span className="text-2xl font-black text-sr-orange">{i + 1}</span>
              <p className="font-black text-[#183153] mt-2 mb-1">{k.tytul}</p>
              <p className="text-sm text-[#3D4D65] leading-relaxed">{k.opis}</p>
            </div>
          ))}
        </div>

        <div className="bg-sr-white border border-sr-line rounded-3xl p-8 sm:p-10 shadow-lg">
          <h2 className="text-xl sm:text-2xl font-black text-[#183153] mb-6">
            Wypełnij formularz
          </h2>
          <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
            <input
              type="text"
              required
              placeholder="Imię i nazwisko"
              value={form.name}
              onChange={set("name")}
              maxLength={200}
              className="w-full bg-sr-sand/30 border border-sr-line focus:border-sr-orange rounded-xl px-4 py-3.5 text-sm text-[#183153] outline-none transition-colors sm:col-span-2"
            />
            <input
              type="email"
              required
              placeholder="Twój e-mail"
              value={form.email}
              onChange={set("email")}
              maxLength={200}
              className="w-full bg-sr-sand/30 border border-sr-line focus:border-sr-orange rounded-xl px-4 py-3.5 text-sm text-[#183153] outline-none transition-colors"
            />
            <input
              type="text"
              required
              placeholder="Twój numer startowy"
              value={form.startNumber}
              onChange={set("startNumber")}
              maxLength={50}
              className="w-full bg-sr-sand/30 border border-sr-line focus:border-sr-orange rounded-xl px-4 py-3.5 text-sm text-[#183153] outline-none transition-colors"
            />
            <input
              type="email"
              required
              placeholder="E-mail osoby zaproszonej"
              value={form.invitedEmail}
              onChange={set("invitedEmail")}
              maxLength={200}
              className="w-full bg-sr-sand/30 border border-sr-line focus:border-sr-orange rounded-xl px-4 py-3.5 text-sm text-[#183153] outline-none transition-colors sm:col-span-2"
            />
            <button
              type="submit"
              disabled={submitting}
              className="cursor-target sm:col-span-2 mt-2 px-5 py-4 bg-sr-orange hover:bg-sr-orange/90 disabled:opacity-50 text-sr-navy font-black rounded-full text-sm tracking-widest uppercase transition-all"
            >
              {submitting ? "Wysyłanie…" : "Wyślij formularz"}
            </button>
            {sukces && (
              <p className="text-sm text-emerald-600 font-bold sm:col-span-2">
                Wysłano! Możesz zaprosić kolejną osobę.
              </p>
            )}
            {error && <p className="text-sm text-sr-red sm:col-span-2">{error}</p>}
          </form>
        </div>
      </div>
    </section>
  );
}

export default ReferralGenerator;
