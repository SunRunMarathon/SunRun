import React from "react";

/**
 * Znaki mediów społecznościowych.
 *
 * Pliki pochodzą z oficjalnych centrów materiałów firm (Meta Brand Resource
 * Center, TikTok Brand Portal), w wersjach jednobarwnych białych.
 *
 * WAŻNE OGRANICZENIE LICENCYJNE: Meta i TikTok dopuszczają wyłącznie wariant
 * BIAŁY albo CZARNY. Nie wolno farbować tych znaków na kolory marki Sun Run,
 * dlatego `tone` przyjmuje tylko te dwie wartości i nie ma tu `currentColor`.
 *
 * Renderujemy je jako MASKĘ, a nie jako obrazek: kształt bierzemy z kanału
 * przezroczystości pliku, a wypełnienie ustawiamy na czystą biel lub czerń.
 * Wynik jest identyczny z oficjalnym plikiem w danym wariancie, więc nie
 * musimy trzymać dwóch kompletów plików.
 *
 * Bez tego zabiegu białe znaki byłyby niewidoczne na białym panelu menu,
 * a znaku Facebooka nie dałoby się odwrócić: to biały krążek z WYCIĘTĄ literą
 * „f", więc litera jest dziurą, przez którą prześwituje tło.
 *
 * Facebook jest w PNG, bo Meta nie udostępnia tego wariantu w SVG.
 */
const ICONS: Record<string, string> = {
  instagram: "/social/instagram.svg",
  facebook: "/social/facebook.png",
  tiktok: "/social/tiktok.svg",
};

export function SocialIcon({
  name,
  size = 20,
  tone = "black",
}: {
  name: string;
  size?: number;
  tone?: "black" | "white";
}) {
  const src = ICONS[name.toLowerCase()];
  if (!src) return null;

  return (
    <span
      aria-hidden="true"
      style={{
        display: "inline-block",
        width: size,
        height: size,
        flex: "0 0 auto",
        backgroundColor: tone === "white" ? "#FFFFFF" : "#000000",
        WebkitMaskImage: `url(${src})`,
        maskImage: `url(${src})`,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        WebkitMaskSize: "contain",
        maskSize: "contain",
      }}
    />
  );
}

export default SocialIcon;
