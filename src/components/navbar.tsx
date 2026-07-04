// @ts-nocheck
"use client";

import React from "react";
import StaggeredMenu from "./StaggeredMenu";

const items = [
  { label: "o nas", link: "/o-nas", ariaLabel: "O nas – organizatorzy Sun Run" },
  { label: "partnerzy", link: "/partnerzy", ariaLabel: "Dla partnerów i sponsorów" },
  { label: "archiwum", link: "/archiwum", ariaLabel: "Archiwum I edycji Sun Run 2025" },
  {
    label: "zapisz się",
    link: "https://frslublin.pl",
    ariaLabel: "Zapisz się na bieg — system FRS",
    external: true,
  },
];

const socialItems = [
  { label: "Instagram", link: "https://instagram.com/sunrunlublin" },
  { label: "Facebook", link: "https://facebook.com/sunrunlublin" },
  { label: "TikTok", link: "https://tiktok.com/@sunrunlublin" },
];

export function Navbar() {
  return (
    <StaggeredMenu
      position="right"
      isFixed
      items={items}
      socialItems={socialItems}
      displaySocials
      displayItemNumbering
      colors={["#EB8714", "#0B4282"]}
      accentColor="#EB8714"
      menuButtonColor="#1A1712"
      openMenuButtonColor="#1A1712"
      changeMenuColorOnOpen={false}
      logoNode={
        <span className="font-black text-[#1A1712] tracking-widest text-base sm:text-lg">
          SUN RUN
        </span>
      }
    />
  );
}
