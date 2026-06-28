import { Separator } from "@/components/ui/separator";
import { Sun, Camera, Globe, Mail } from "lucide-react";

const quickLinks = [
  { label: "O nas", href: "#about" },
  { label: "Zapisy", href: "#pricing" },
  { label: "Trasa", href: "#route" },
  { label: "Wolontariat", href: "#volunteer" },
  { label: "Partnerzy", href: "#sponsors" },
  { label: "Kontakt", href: "#contact" },
] as const;

const socialLinks = [
  { icon: Camera, href: "#", label: "Instagram" },
  { icon: Globe, href: "#", label: "Facebook" },
  { icon: Mail, href: "mailto:kontakt@sunrun.pl", label: "Email" },
] as const;

export default function Footer() {
  return (
    <footer className="bg-zinc-950 px-4 pt-16 pb-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 md:grid-cols-3">
          {/* Branding */}
          <div>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10">
                <Sun className="size-6 text-amber-500" />
              </div>
              <div>
                <p className="text-lg font-bold text-white">Sun Run</p>
                <p className="text-xs text-zinc-500">Bieg charytatywny</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-zinc-500">
              Biegnij dla tych, którzy już nie mogą. Charytatywny bieg na 5 km
              w&nbsp;Lublinie wspierający Hospicjum Dobrego Samarytanina.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-amber-500">
              Szybkie linki
            </p>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-zinc-400 transition-colors hover:text-amber-400"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social & contact */}
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-amber-500">
              Obserwuj nas
            </p>
            <div className="mb-6 flex gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="flex size-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/50 text-zinc-400 transition-all hover:border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-400"
                  >
                    <Icon className="size-5" />
                  </a>
                );
              })}
            </div>
            <p className="text-sm text-zinc-500">
              Lublin, Polska
              <br />
              Park Ludowy, al. J. Piłsudskiego
            </p>
          </div>
        </div>

        <Separator className="my-8 bg-zinc-800" />

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-zinc-600">
            © {new Date().getFullYear()} Sun Run. Wszelkie prawa zastrzeżone.
          </p>
          <p className="text-xs text-zinc-600">
            Projekt realizowany przez młodzież z&nbsp;Lublina 🧡
          </p>
        </div>
      </div>
    </footer>
  );
}
