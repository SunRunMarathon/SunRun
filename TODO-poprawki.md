# Plan poprawek — sesja (2026-07-04)

## RUNDA 2

- [x] ScrollStack: cieplejsze karty (`bg-white` → `#F7EFDF`), fix rozjeżdżania przy zdjęciu
  (ResizeObserver na kartach/inner + `loading="eager"` na zdjęciach → przelicza offsety
  gdy obraz zmienia layout). Zweryfikowane w przeglądarce — 3 karty ze zdjęciami OK.
- [x] Usunięto emotki (🏥🙋🤝) z nagłówków kart ScrollStack.
- [x] MetaBalls: szersza strefa zaniku po LEWEJ (smoothstep 0.16 → 0.40) — kula nie prześwituje.
- [x] Gradient na mainpage bardziej widoczny (mocniejsze ciepłe kolory, contrast 1.25,
  saturation 0.95, nakładka /50 → /38, szybszy warp).
- [x] Navbar: czerń `#0d0d11` → granat marki `#0B4282` (wyróżnia się, nie czarny/krzykliwy).
- [x] Partnerzy: dodane zdjęcie "Uniwersytet Jazdy" (HEIC/obrócony JPG → EXIF-transpose →
  1350×1800 WebP) w sekcji "Partner w akcji".
- [x] ScrollFloat NAPRAWIONY: przyczyną był Turbopack HMR panic (serwował stary bundle) +
  niepewny `immediateRender` w `fromTo`. Rozwiązanie: przepisane na `gsap.set` (jawny stan
  ukryty) + `gsap.to` z `toggleActions: play … reverse` (odpalenie przy wejściu w kadr,
  odporne na piny/layout), `gsap.context` (StrictMode). Zweryfikowane na stronie testowej
  w przeglądarce (stan 0 → play → 1). Strona testowa usunięta.


## 1. ScrollStack — cieplejszy kolor głównej karty
- Plik: `src/app/page.tsx` (ScrollStackItem `itemClassName`)
- Problem: `bg-white` za mocno wybija się na tle kremowego tła.
- Rozwiązanie: zmienić `bg-white` → ciepły off-white (np. `#F7EFDF`) we wszystkich 3 kartach.
- [x] Zrobione

## 2. Hero SUN RUN + opis + przyciski — +20%
- Plik: `src/app/page.tsx` (sekcja HERO)
- Powiększyć: tytuł h1, podkreślenie, [DATA BIEGU], kartę opisu, przyciski CTA.
- [x] Zrobione

## 3. Sekcja z mapą — +30% (większa część strony)
- Plik: `src/app/page.tsx` (sekcja STATS)
- Zwiększyć wysokość mapy (~480px → ~620px) i szerokość kontenera; karty po prawej rosną razem.
- [x] Zrobione

## 4. Hamburger — odporność na inercję scrolla
- Plik: `src/components/BubbleMenu.tsx`
- Problem: po zatrzymaniu scrolla strona jeszcze płynnie hamuje → event `scroll` zamyka menu tuż po otwarciu.
- Rozwiązanie: usunąć nasłuch `scroll` (odpala się podczas inercji); reagować tylko na realny `wheel` (z progiem deltaY) i `touchmove`. Zostawić arm-delay.
- [x] Zrobione

## 5. Partnerzy — FallingText rozsypuje się gdy górna linijka dotknie góry ekranu
- Plik: `src/components/FallingText.tsx`
- Zmiana warunku: z `rect.bottom <= 55% vh` na `rect.top <= ~0` (górna linijka przy górze ekranu).
- [x] Zrobione

## 6. Partnerzy — "A bieganie to.." → "Bo bieganie to.."
- Plik: `src/app/partnerzy/page.tsx`
- [x] Zrobione

## 7. Partnerzy — RotatingText: pula 10 słów, losuj 3 przy każdym odświeżeniu, blokada usera na 3 słowa
- Plik: `src/app/partnerzy/page.tsx`
- Pula 10 słów, na mount losuj 3; skrócić pin (dłuższy scroll na słowo → mniej zacinania); onUpdate liczyć wg 3.
- [x] Zrobione

## 8. Partnerzy — "Liczby nie kłamią": usunąć "najedź na tekst", tekst dużo większy i więcej linii
- Plik: `src/app/partnerzy/page.tsx`
- [x] Zrobione

## 9. Partnerzy — "Wybierz Sun Run" (ScrollFloat) ma działać jak w przykładzie ReactBits
- Plik: `src/app/partnerzy/page.tsx` (użycie)
- Komponent był OK (spacje jako  ). Wyrównałem propsy do przykładu:
  scrollStart="center bottom+=50%", scrollEnd="bottom bottom-=40%", stagger=0.03.
- [x] Zrobione

## 11. Zdjęcia z /public/photos
- ScrollStack karta 1 → hospicujm.webp; karta 2 → sztab.jpg; karta 3 → partner.avif (`page.tsx`)
- o-nas hero prawa strona → ekipa.webp (`o-nas/page.tsx`)
- ekipa.HEIC (nierenderowalny w przeglądarce) skonwertowany Pythonem (pillow-heif):
  EXIF-transpose → resize 1800px → WebP q88 (4MB → 795KB, orientacja OK).
- [x] Zrobione

## 10. Usunąć back-link "← Strona główna" z o-nas i archiwum
- Pliki: `src/app/o-nas/page.tsx`, `src/app/archiwum/page.tsx`
- [x] Zrobione
