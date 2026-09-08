import { NextRequest, NextResponse } from "next/server";
import { isAuthorizedRequest } from "@/lib/admin-session";
import { generateCombinedPdf, generateZip, loadTemplate, MAX_RANGE } from "@/lib/bib-generator";
import type { BibConfig } from "@/lib/bib-types";

export const runtime = "nodejs";

const ALLOWED_TYPES = ["application/pdf", "image/png", "image/jpeg"];

export async function POST(request: NextRequest) {
  if (!isAuthorizedRequest(request)) {
    return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
  }

  const form = await request.formData();
  const templateFile = form.get("template");
  const configRaw = form.get("config");
  if (!(templateFile instanceof File) || typeof configRaw !== "string") {
    return NextResponse.json({ error: "Brak szablonu lub konfiguracji" }, { status: 400 });
  }

  let cfg: BibConfig;
  try {
    cfg = JSON.parse(configRaw);
  } catch {
    return NextResponse.json({ error: "Nieprawidłowa konfiguracja" }, { status: 400 });
  }

  if (
    !Number.isFinite(cfg.start) ||
    !Number.isFinite(cfg.end) ||
    cfg.start < 1 ||
    cfg.end < cfg.start ||
    cfg.end - cfg.start + 1 > MAX_RANGE
  ) {
    return NextResponse.json(
      { error: `Nieprawidłowy zakres numerów (maksymalnie ${MAX_RANGE} naraz)` },
      { status: 400 }
    );
  }
  if (!Number.isFinite(cfg.xFraction) || !Number.isFinite(cfg.yFraction) || !Number.isFinite(cfg.fontSize)) {
    return NextResponse.json({ error: "Brak pozycji lub rozmiaru numeru" }, { status: 400 });
  }

  const mimeType = templateFile.type;
  if (!ALLOWED_TYPES.includes(mimeType)) {
    return NextResponse.json({ error: "Nieobsługiwany format szablonu (PDF, PNG lub JPG)" }, { status: 400 });
  }

  const bytes = new Uint8Array(await templateFile.arrayBuffer());
  const tpl = await loadTemplate(
    bytes,
    mimeType,
    cfg.pageWidthPt && cfg.pageHeightPt ? { w: cfg.pageWidthPt, h: cfg.pageHeightPt } : undefined
  );

  if (cfg.mode === "zip") {
    const zipBytes = await generateZip(tpl, cfg);
    return new NextResponse(Buffer.from(zipBytes), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="numery-startowe-${cfg.start}-${cfg.end}.zip"`,
      },
    });
  }

  const pdfBytes = await generateCombinedPdf(tpl, cfg);
  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="numery-startowe-${cfg.start}-${cfg.end}.pdf"`,
    },
  });
}
