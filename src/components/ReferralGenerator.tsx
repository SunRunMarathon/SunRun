"use client";

import { useEffect, useState } from "react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://sunrun.pl";

const EMPTY_FORM = { name: "", email: "", startNumber: "" };

const KROKI = [
  {
    tytul: "Podajesz swoje dane",
    opis: "Imię, e-mail i numer startowy - to wystarczy, żeby wygenerować Twój link.",
  },
  {
    tytul: "Wysyłasz link, gdzie chcesz",
    opis: "Messenger, Instagram, SMS - Twój link działa od razu, numer startowy weryfikujemy w tle.",
  },
  {
    tytul: "Śledzimy razem efekty",
    opis: "Widzimy, ile osób dzięki Tobie odwiedziło stronę i ile z nich faktycznie się zapisało.",
  },
];

// Pelna wersja generatora linku - wczesniej byla to niewielka karta + modal
// na stronie glownej, ale modal potrafil renderowac sie POD pozniejszymi
// sekcjami (Wspomnienia/FAQ/Partnerzy), a sama karta byla zbyt maloczytelna
// jak na cos, co ma zachecac do udzialu. Osobna podstrona rozwiazuje oba
// problemy: nic jej nie przykrywa i jest miejsce na pelne wyjasnienie.
export function ReferralGenerator() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setCanNativeShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  const set = (key: keyof typeof EMPTY_FORM) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const link = code ? `${SITE_URL}/zaproszenie/${code}` : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/referral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.code) {
        setError(data.error || "Nie udało się wygenerować linku");
        return;
      }
      setCode(data.code);
    } catch {
      setError("Błąd połączenia z serwerem");
    } finally {
      setSubmitting(false);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // brak dostepu do schowka - link i tak jest widoczny na ekranie
    }
  };

  const nativeShare = async () => {
    try {
      await navigator.share({
        title: "Sun Run 2026",
        text: "Dołącz do mnie na Sun Run 2026 - charytatywnym biegu w Lublinie na rzecz Hospicjum Dobrego Samarytanina!",
        url: link,
      });
    } catch {
      // uzytkownik anulowal system share
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
          <p className="text-base sm:text-lg text-[#3D4D65] leading-relaxed max-w-xl mx-auto">
            Masz już numer startowy? Wygeneruj swój osobisty link i zaproś znajomych do udziału
            w Sun Run 2026 - charytatywnym biegu w Parku Ludowym na rzecz Hospicjum Dobrego
            Samarytanina.
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
          {code ? (
            <>
              <h2 className="text-xl sm:text-2xl font-black text-[#183153] mb-2">
                Twój link jest gotowy!
              </h2>
              <p className="text-sm text-[#3D4D65] mb-6">
                Numer startowy zweryfikujemy w tle — link działa od razu, nie musisz czekać.
                Wysłaliśmy go też na Twój e-mail.
              </p>
              <div className="bg-sr-sand/30 border border-sr-line rounded-2xl px-5 py-4 text-sm sm:text-base text-[#183153] break-all mb-5">
                {link}
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                {canNativeShare && (
                  <button
                    type="button"
                    onClick={nativeShare}
                    className="cursor-target flex-1 px-5 py-3.5 bg-sr-navy text-sr-orange rounded-2xl text-sm font-bold transition-colors hover:bg-sr-navy/90"
                  >
                    Udostępnij przez aplikację…
                  </button>
                )}
                <button
                  type="button"
                  onClick={copyLink}
                  className="cursor-target flex-1 px-5 py-3.5 bg-white border border-sr-line hover:border-sr-orange rounded-2xl text-sm font-bold text-[#183153] transition-colors"
                >
                  {copied ? "Link skopiowany ✓" : "Kopiuj link"}
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-xl sm:text-2xl font-black text-[#183153] mb-6">
                Wygeneruj swój link
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
                  placeholder="E-mail"
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
                <button
                  type="submit"
                  disabled={submitting}
                  className="cursor-target sm:col-span-2 mt-2 px-5 py-4 bg-sr-orange hover:bg-sr-orange/90 disabled:opacity-50 text-sr-navy font-black rounded-full text-sm tracking-widest uppercase transition-all"
                >
                  {submitting ? "Generowanie…" : "Wygeneruj link"}
                </button>
                {error && <p className="text-sm text-sr-red sm:col-span-2">{error}</p>}
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export default ReferralGenerator;
