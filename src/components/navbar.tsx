// @ts-nocheck
"use client";

import React from "react";
import BubbleMenu from "./BubbleMenu";

const items = [
  {
    label: "o nas",
    href: "/o-nas",
    ariaLabel: "O nas – organizatorzy Sun Run",
    rotation: -8,
    hoverStyles: { bgColor: "#0B4282", textColor: "#E8EBF7" },
  },
  {
    label: "partnerzy",
    href: "/partnerzy",
    ariaLabel: "Dla partnerów i sponsorów",
    rotation: 8,
    hoverStyles: { bgColor: "#EB8714", textColor: "#0d0d11" },
  },
  {
    label: "archiwum",
    href: "/archiwum",
    ariaLabel: "Archiwum I edycji Sun Run 2025",
    rotation: -5,
    hoverStyles: { bgColor: "#ED3939", textColor: "#E8EBF7" },
  },
  {
    label: "zapisz się",
    href: "https://frslublin.pl",
    ariaLabel: "Zapisz się na bieg — system FRS",
    rotation: 6,
    hoverStyles: { bgColor: "#FFEC8E", textColor: "#0d0d11" },
  },
  {
    label: "instagram",
    href: "https://instagram.com/sunrunlublin",
    ariaLabel: "Sun Run na Instagramie",
    rotation: -7,
    hoverStyles: { bgColor: "#E8EBF7", textColor: "#0d0d11" },
  },
  {
    label: "facebook",
    href: "https://facebook.com/sunrunlublin",
    ariaLabel: "Sun Run na Facebooku",
    rotation: 4,
    hoverStyles: { bgColor: "#0B4282", textColor: "#E8EBF7" },
  },
];

export function Navbar() {
  return (
    <BubbleMenu
      logo={
        <span className="font-black text-white tracking-widest text-sm sm:text-base">
          SUN RUN
        </span>
      }
      items={items}
      menuAriaLabel="Otwórz nawigację"
      menuBg="#0d0d11"
      menuContentColor="#ffffff"
      useFixedPosition={true}
      animationEase="back.out(1.5)"
      animationDuration={0.5}
      staggerDelay={0.1}
    />
  );
}
