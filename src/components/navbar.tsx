"use client";

import { useState } from "react";
import { Sun, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";

const navLinks = [
  { label: "O nas", href: "#about" },
  { label: "Hospicjum", href: "#beneficiary" },
  { label: "Zapisy", href: "#pricing" },
  { label: "Trasa", href: "#route" },
  { label: "Wolontariat", href: "#volunteer" },
  { label: "Sponsorzy", href: "#sponsors" },
  { label: "Historia", href: "#history" },
] as const;

export function Navbar() {
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleLinkClick = () => {
    setSheetOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <a href="#" className="group flex items-center gap-2.5">
            <Sun className="size-7 text-amber-500 transition-transform duration-500 group-hover:rotate-90" />
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              SUN RUN
            </span>
          </a>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm font-medium text-zinc-400 transition-colors duration-200 hover:text-amber-500 rounded-lg hover:bg-zinc-800/50"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Desktop CTA */}
            <Button
              asChild
              className="hidden lg:inline-flex bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold border-amber-500/50 shadow-lg shadow-amber-500/10 transition-all duration-200 hover:shadow-amber-500/20"
            >
              <a
                href="https://frslublin.pl"
                target="_blank"
                rel="noopener noreferrer"
              >
                Zapisz się
              </a>
            </Button>

            {/* Mobile hamburger */}
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden text-zinc-400 hover:text-amber-500"
                  aria-label="Otwórz menu"
                >
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>

              <SheetContent
                side="right"
                className="w-72 bg-zinc-950 border-zinc-800 p-0"
              >
                {/* Sheet header */}
                <div className="flex items-center gap-2.5 border-b border-zinc-800 px-6 py-5">
                  <Sun className="size-6 text-amber-500" />
                  <SheetTitle className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                    SUN RUN
                  </SheetTitle>
                </div>

                {/* Mobile links */}
                <div className="flex flex-col gap-1 px-4 py-4">
                  {navLinks.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={handleLinkClick}
                      className="rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-400 transition-colors duration-200 hover:text-amber-500 hover:bg-zinc-800/60"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>

                {/* Mobile CTA */}
                <div className="mt-auto border-t border-zinc-800 px-4 py-4">
                  <Button
                    asChild
                    className="w-full bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold border-amber-500/50 shadow-lg shadow-amber-500/10"
                  >
                    <a
                      href="https://frslublin.pl"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={handleLinkClick}
                    >
                      Zapisz się
                    </a>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
