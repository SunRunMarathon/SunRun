import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb } from "pdf-lib";
import JSZip from "jszip";
import type { BibConfig, BibFont } from "./bib-types";

const FONT_MAP: Record<BibFont, string> = {
  "Helvetica-Bold": StandardFonts.HelveticaBold,
  Helvetica: StandardFonts.Helvetica,
  "Times-Bold": StandardFonts.TimesRomanBold,
  "Courier-Bold": StandardFonts.CourierBold,
};

// Maksymalna liczba numerow w jednym zadaniu - wystarcza z zapasem na 400
// numerow startowych, ale chroni serwer przed przypadkowym zadaniem na
// dziesiatki tysiecy stron.
export const MAX_RANGE = 2000;

function hexToColor(hex: string) {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;
  return rgb(r || 0, g || 0, b || 0);
}

function colorForNumber(n: number, cfg: BibConfig) {
  const rule = cfg.colorRules.find((r) => n >= r.from && n <= r.to);
  return hexToColor(rule ? rule.color : cfg.defaultColor);
}

export type TemplateKind = "pdf" | "image";

export interface LoadedTemplate {
  kind: TemplateKind;
  width: number;
  height: number;
  srcPdf?: PDFDocument;
  imageBytes?: Uint8Array;
  imageType?: "png" | "jpg";
}

export async function loadTemplate(
  bytes: Uint8Array,
  mimeType: string,
  pageSize?: { w: number; h: number }
): Promise<LoadedTemplate> {
  if (mimeType === "application/pdf") {
    const srcPdf = await PDFDocument.load(bytes);
    const page = srcPdf.getPage(0);
    return { kind: "pdf", width: page.getWidth(), height: page.getHeight(), srcPdf };
  }
  const imageType = mimeType === "image/png" ? "png" : "jpg";
  return {
    kind: "image",
    width: pageSize?.w ?? 595.44,
    height: pageSize?.h ?? 419.76,
    imageBytes: bytes,
    imageType,
  };
}

async function embedBackground(doc: PDFDocument, tpl: LoadedTemplate) {
  if (tpl.kind === "pdf") {
    const [embedded] = await doc.embedPdf(tpl.srcPdf!, [0]);
    return (page: PDFPage) =>
      page.drawPage(embedded, { x: 0, y: 0, width: tpl.width, height: tpl.height });
  }
  const image =
    tpl.imageType === "png" ? await doc.embedPng(tpl.imageBytes!) : await doc.embedJpg(tpl.imageBytes!);
  return (page: PDFPage) => page.drawImage(image, { x: 0, y: 0, width: tpl.width, height: tpl.height });
}

function drawNumber(page: PDFPage, font: PDFFont, text: string, cfg: BibConfig, tpl: LoadedTemplate) {
  const size = cfg.fontSize;
  const textWidth = font.widthOfTextAtSize(text, size);
  const x = cfg.xFraction * tpl.width - textWidth / 2;
  const y = tpl.height - cfg.yFraction * tpl.height - size * 0.35;
  page.drawText(text, { x, y, size, font, color: colorForNumber(Number(text), cfg) });
}

export async function generateCombinedPdf(tpl: LoadedTemplate, cfg: BibConfig): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const drawBg = await embedBackground(doc, tpl);
  const font = await doc.embedFont(FONT_MAP[cfg.font]);
  for (let n = cfg.start; n <= cfg.end; n++) {
    const page = doc.addPage([tpl.width, tpl.height]);
    drawBg(page);
    drawNumber(page, font, String(n), cfg, tpl);
  }
  return doc.save();
}

export async function generateZip(tpl: LoadedTemplate, cfg: BibConfig): Promise<Uint8Array> {
  const zip = new JSZip();
  const padWidth = String(cfg.end).length;
  for (let n = cfg.start; n <= cfg.end; n++) {
    const doc = await PDFDocument.create();
    const drawBg = await embedBackground(doc, tpl);
    const font = await doc.embedFont(FONT_MAP[cfg.font]);
    const page = doc.addPage([tpl.width, tpl.height]);
    drawBg(page);
    drawNumber(page, font, String(n), cfg, tpl);
    zip.file(`numer_${String(n).padStart(padWidth, "0")}.pdf`, await doc.save());
  }
  return zip.generateAsync({ type: "uint8array", compression: "STORE" });
}
