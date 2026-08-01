"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { trackShare } from "@/lib/track-share";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://sunrun.pl";

function buildUrl(medium: string) {
  const url = new URL(SITE_URL);
  url.searchParams.set("utm_source", "share");
  url.searchParams.set("utm_medium", medium);
  return url.toString();
}

export function ShareModal() {
  const [open, setOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState<"link" | "qr" | null>(null);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setCanNativeShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  const openModal = () => {
    trackShare("modal_open");
    setOpen(true);
    setCopied(null);
    QRCode.toDataURL(buildUrl("qr"), { width: 320, margin: 2, color: { dark: "#183153", light: "#FFFFFF" } })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(null));
  };

  const close = () => setOpen(false);

  const copyToClipboard = async (text: string, which: "link") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(which);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // brak dostępu do schowka — po cichu ignorujemy, przycisk i tak pokazuje link
    }
  };

  const downloadQr = () => {
    if (!qrDataUrl) return;
    trackShare("qr_download");
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = "sun-run-qr.png";
    a.click();
  };

  const copyQrImage = async () => {
    if (!qrDataUrl) return;
    try {
      const res = await fetch(qrDataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
      trackShare("qr_copy");
      setCopied("qr");
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // przeglądarka bez wsparcia dla ClipboardItem obrazów — zostaje pobieranie
      downloadQr();
    }
  };

  const shareTwitter = () => {
    trackShare("twitter");
    const url = buildUrl("twitter");
    const text = "Dołącz do Sun Run 2026 - charytatywnego biegu w Lublinie na rzecz Hospicjum Dobrego Samarytanina!";
    window.open(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const shareFacebook = () => {
    trackShare("facebook");
    const url = buildUrl("facebook");
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const copyLink = () => copyToClipboard(buildUrl("copy_link"), "link");

  const nativeShare = async () => {
    try {
      await navigator.share({
        title: "Sun Run 2026",
        text: "Dołącz do Sun Run 2026 - charytatywnego biegu w Lublinie na rzecz Hospicjum Dobrego Samarytanina!",
        url: buildUrl("native_share"),
      });
      trackShare("native_share");
    } catch {
      // użytkownik anulował system share — nic nie robimy
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="cursor-target flex items-center gap-2 text-sm text-sr-sand/80 hover:text-sr-orange transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.6" y1="10.5" x2="15.4" y2="6.5" />
          <line x1="8.6" y1="13.5" x2="15.4" y2="17.5" />
        </svg>
        Udostępnij
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Udostępnij Sun Run"
        >
          <div className="absolute inset-0 bg-[#183153]/60 backdrop-blur-sm" onClick={close} />
          <div className="relative w-full max-w-md bg-sr-sand border border-sr-line rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={close}
              aria-label="Zamknij"
              className="cursor-target absolute right-4 top-4 w-9 h-9 flex items-center justify-center rounded-full text-[#3D4D65] hover:text-[#183153] hover:bg-black/5 transition-colors text-xl leading-none"
            >
              ×
            </button>

            <h2 className="text-lg sm:text-xl font-black text-[#183153] pr-8 mb-6">
              Udostępnij Sun Run
            </h2>

            {/* QR kod */}
            <div className="flex flex-col items-center gap-3 mb-6 pb-6 border-b border-sr-line">
              {qrDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrDataUrl}
                  alt="Kod QR prowadzący do sunrun.pl"
                  width={180}
                  height={180}
                  className="rounded-2xl border border-sr-line"
                />
              ) : (
                <div className="w-[180px] h-[180px] rounded-2xl bg-white/60 animate-pulse" />
              )}
              <div className="flex gap-2 w-full">
                <button
                  type="button"
                  onClick={copyQrImage}
                  className="cursor-target flex-1 px-4 py-2.5 bg-white border border-sr-line hover:border-sr-orange rounded-full text-xs font-bold uppercase tracking-wide text-[#183153] transition-colors"
                >
                  {copied === "qr" ? "Skopiowano ✓" : "Kopiuj kod"}
                </button>
                <button
                  type="button"
                  onClick={downloadQr}
                  className="cursor-target flex-1 px-4 py-2.5 bg-white border border-sr-line hover:border-sr-orange rounded-full text-xs font-bold uppercase tracking-wide text-[#183153] transition-colors"
                >
                  Pobierz PNG
                </button>
              </div>
            </div>

            {/* Kanaly */}
            <div className="flex flex-col gap-3">
              {canNativeShare && (
                <button
                  type="button"
                  onClick={nativeShare}
                  className="cursor-target px-5 py-3.5 bg-sr-navy text-sr-orange rounded-2xl text-sm font-bold transition-colors hover:bg-sr-navy/90"
                >
                  Udostępnij przez aplikację…
                </button>
              )}
              <button
                type="button"
                onClick={shareTwitter}
                className="cursor-target px-5 py-3.5 bg-white border border-sr-line hover:border-sr-orange rounded-2xl text-sm font-bold text-[#183153] transition-colors text-left"
              >
                X / Twitter
              </button>
              <button
                type="button"
                onClick={shareFacebook}
                className="cursor-target px-5 py-3.5 bg-white border border-sr-line hover:border-sr-orange rounded-2xl text-sm font-bold text-[#183153] transition-colors text-left"
              >
                Facebook
              </button>
              <button
                type="button"
                onClick={copyLink}
                className="cursor-target px-5 py-3.5 bg-white border border-sr-line hover:border-sr-orange rounded-2xl text-sm font-bold text-[#183153] transition-colors text-left"
              >
                {copied === "link" ? "Link skopiowany ✓" : "Kopiuj link"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ShareModal;
