import { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://sunrun.pl";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Panel admina NIE jest tu wypisany celowo - to jego jedyna ochrona
        // (ukryta, nieprzewidywalna sciezka). Wpisanie jej do robots.txt
        // (pliku publicznie dostepnego dla kazdego) natychmiast zdradziloby
        // adres kazdemu, kto go otworzy - dokladne przeciwienstwo ukrycia.
        disallow: ["/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
