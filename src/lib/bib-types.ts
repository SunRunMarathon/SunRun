// Wspolne typy dla generatora numerow startowych - bez zaleznosci wykonywalnych,
// wiec bezpiecznie importuje je zarowno klient (formularz w ukrytym narzedziu),
// jak i serwer (API route + bib-generator).

export type BibFont = "Helvetica-Bold" | "Helvetica" | "Times-Bold" | "Courier-Bold";

export interface BibColorRule {
  from: number;
  to: number;
  color: string; // hex, np. "#E4572E"
}

export interface BibConfig {
  xFraction: number; // 0-1, od lewej krawedzi strony
  yFraction: number; // 0-1, od gornej krawedzi strony
  fontSize: number; // w punktach PDF
  font: BibFont;
  defaultColor: string; // hex
  colorRules: BibColorRule[];
  start: number;
  end: number;
  mode: "single" | "zip";
  // Uzywane tylko gdy szablonem jest obraz (PNG/JPG) - dla PDF rozmiar strony
  // bierzemy wprost ze strony szablonu.
  pageWidthPt?: number;
  pageHeightPt?: number;
}
