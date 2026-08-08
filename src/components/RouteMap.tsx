// @ts-nocheck
"use client";

import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './RouteMap.css';

// Wykrywanie intencji scrolla nad mapą.
// Domyślnie zoom kółkiem jest WYŁĄCZONY, więc gdy użytkownik przewija stronę
// z góry na dół i tylko przejeżdża kursorem nad mapą — strona scrolluje się dalej.
// Zoom UZBRAJA SIĘ dopiero, gdy kursor "odpocznie" nad mapą ~450 ms bez ruchu
// kółka (czyli świadomie zatrzymał się, by przybliżać). Każde kółko w trakcie
// aktywnego przewijania resetuje ten licznik, więc scroll nigdy nie zostaje "złapany".
function ScrollZoomIntent() {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();
    let armTimer = null;
    let armed = false;

    const disarm = () => {
      armed = false;
      map.scrollWheelZoom.disable();
    };
    const arm = () => {
      armed = true;
      map.scrollWheelZoom.enable();
    };
    const scheduleArm = () => {
      clearTimeout(armTimer);
      armTimer = setTimeout(arm, 450);
    };

    disarm();

    const onEnter = () => scheduleArm();
    const onLeave = () => {
      clearTimeout(armTimer);
      disarm();
    };
    const onWheel = () => {
      // Dopóki nie uzbrojone, każde kółko odracza uzbrojenie — aktywny scroll
      // przez stronę nie włączy zoomu. Po zatrzymaniu (brak kółka 450 ms) → zoom.
      if (!armed) scheduleArm();
    };

    container.addEventListener('mouseenter', onEnter);
    container.addEventListener('mouseleave', onLeave);
    container.addEventListener('wheel', onWheel, { passive: true });

    return () => {
      clearTimeout(armTimer);
      container.removeEventListener('mouseenter', onEnter);
      container.removeEventListener('mouseleave', onLeave);
      container.removeEventListener('wheel', onWheel);
    };
  }, [map]);

  return null;
}

// CZWARTE podejście do tej trasy. Trzecie (patrz historia w git) miało dwie
// wady, które Milosz zaznaczył ręcznie na zrzucie z żywej strony: (1) trasa
// wypuszczała się za daleko na wschód, w stronę Piasek/Dworcowej (pętla
// way 1005422292 od strony Targów) i (2) w płn-zach części parku skręcała
// na skos przez środek (way 62364771) zamiast trzymać się zewnętrznej
// krawędzi. Obie te rzeczy zostały tu usunięte. W ich miejsce doszła spora
// część trasy, której wcześniej brakowało: dalsze przedłużenie zachodniej
// krawędzi w stronę ul. Stadionowej, duży płat południowy sięgający niemal
// do ul. Lubelskiego Lipca '80, i powrót na północ przez środek parku,
// zamykający kształt. Segmenty 0-82 (start, szpilka do fontanny, rondo,
// ramię północne i zachodnie do punktu z wodą) są niezmienione względem
// trzeciego podejścia - błędy dotyczyły wyłącznie części za punktem z wodą.
//
// Każdy odcinek to konkretny, zweryfikowany fragment alejki z OpenStreetMap
// (Overpass API), połączony w kolejności:
//
//  0-13   Jedna z dwóch równoległych alejek do fontanny i z powrotem,
//         szpilka przy okrągłym zbiorniku wodnym (bez zmian).
//  13-23  Druga równoległa alejka z powrotem do ronda (bez zmian).
//  23-28  Rondo przy Targach Lublin -> narożnik wschodni (bez zmian).
//  29-50  Ramię północne wzdłuż al. Piłsudskiego (bez zmian).
//  51-82  Ramię zachodnie wzdłuż Bystrzycy do punktu z wodą (bez zmian).
//  82     PUNKT Z WODĄ - bez zmian.
//  82-83  Dalszy ciąg zachodniej krawędzi za punkt wody (way 294442929) -
//         to jest przedłużenie "dalej na południowy zachód", o które
//         prosił Milosz, zamiast dawnego skosu przez środek (62364771,
//         USUNIĘTY).
//  83-108 Poprzez way 995319614 + 959638425 + 959638422 w stronę ul.
//         Stadionowej - realna krawędź parku, nie przybliżenie.
//  108-125 Way 442874000 - szeroki łuk przez południowy płat parku, w dół
//         do niemal samej ul. Lubelskiego Lipca '80. To jest ten "duży
//         brakujący kawałek", o którym pisał Milosz.
//  125-126 Krótkie połączenie z powrotem do południowego węzła way 62364768
//         (way 421557439).
//  126-159 Way 62364768 - powrót na północ przez środek parku, zamykający
//         kształt trasy, z powrotem do ronda/startu. Dawna pętla wokół
//         wschodniego płata (way 1005422292, USUNIĘTA) już się tu nie
//         pojawia.
//
// START/META (punkt 0) leży NA OSTRODZE, bliżej ronda niż fontanny -
// bez zmian względem poprzednich podejść.
//
// Zweryfikowany dystans jednego okrążenia (Haversine, z zamknięciem pętli
// do startu): ok. 2,61 km - bliżej celu 2,5 km niż poprzednie 2,34 km
// (różnica w dużej mierze to nowy płat południowy). Dwa okrążenia dają
// ok. 5,2 km. Ostateczny dystans i tak zmierzy pomiar do certyfikacji PZLA.
const ROUTE_LOOP = [
  [51.23634, 22.56145], // 0 - linia startu
  [51.23671, 22.56071],
  [51.237198, 22.559709], // 2 - rozpoczęcie nawrotki
  [51.237223, 22.559609],
  [51.237256, 22.559506],
  [51.237242, 22.559381],
  [51.237224, 22.559327], // 6 - środek nawrotki
  [51.237193, 22.559300],
  [51.237153, 22.559277],
  [51.237131, 22.559277],
  [51.237099, 22.559301], // 10 - koniec nawrotki
  [51.235810, 22.561935], // 11 - początek ronda
  [51.235750, 22.562019],
  [51.235679, 22.562043],
  [51.235607, 22.562024], // 14 - koniec ronda
  [51.234624, 22.560358], // 15 - początek skręt alfa
  [51.234564, 22.560296],
  [51.234520, 22.560291],
  [51.234486, 22.560346], // 18 - koniec skręt alfa
  [51.234189, 22.560860], // 19 - początek łuk beta
  [51.234098, 22.561120],
  [51.234069, 22.561442], // 21 - koniec łuk beta
  [51.234154, 22.562466], // 22 - początek skręt gamma
  [51.234164, 22.562567],
  [51.234074, 22.562586], // 24 - koniec skręt gamma
  [51.233424, 22.562725], // 25 - łuk delta
  [51.233015, 22.562715], // 26 - koniec
  [51.232730, 22.562170], // 27 - skręt epsilon
  [51.232700, 22.562045],
  [51.232718, 22.561971],
  [51.232786, 22.561828], // 30 - koniec
  [51.233127, 22.561203], // 31 - serpentyna zeta
  [51.233153, 22.561061],
  [51.233243, 22.560956],
  [51.233332, 22.560958],
  [51.233410, 22.560931],
  [51.233470, 22.560833],
  [51.233517, 22.560693], // 37 - koniec
  [51.233737, 22.560342], // 38 - łuk eta
  [51.233977, 22.560092],
  [51.234173, 22.559613], // 40 - koniec, łuk theta
  [51.234336, 22.559127],
  [51.234597, 22.558816],
  [51.234946, 22.558714], // 43 - WODA
  [51.235127, 22.558706], // 44 - koniec, łuk jota
  [51.235285, 22.558553],
  [51.235377, 22.558331],
  [51.235421, 22.558131], // 47 - koniec, skręt kappa
  [51.235444, 22.558085],
  [51.235465, 22.558080],
  [51.235487, 22.558091], // 50 - koniec, łuk lambda
  [51.235717, 22.558370],
  [51.236211, 22.558587],
  [51.236639, 22.558608], // 53 - koniec
  [51.238475, 22.558541], // 54 - skręt mi
  [51.238495, 22.558565],
  [51.238508, 22.558607], // 56 - koniec
  [51.238517, 22.558672], // 57 - skręt ni
  [51.238529, 22.558708],
  [51.238551, 22.558736],
  [51.238594, 22.558757], // 69 - koniec, serpentyna ksi
  [51.238704, 22.558826],
  [51.238779, 22.558907],
  [51.238930, 22.558972],
  [51.239010, 22.559129], // 64 - koniec, skręt omikron
  [51.239015, 22.559147],
  [51.239030, 22.559158], // 66 - koniec, nawrotka pi
  [51.239116, 22.559202],
  [51.239174, 22.559320],
  [51.239175, 22.559423],
  [51.239158, 22.559498],
  [51.239133, 22.559540],
  [51.239096, 22.559576],
  [51.239050, 22.559594], // 73 - koniec
  [51.238895, 22.559630], // 74 - skręt ro
  [51.238872, 22.559641],
  [51.238858, 22.559657],
  [51.238847, 22.559685], // 77 - koniec
  [51.238515, 22.560527], // 78 - łuk sigma
  [51.238458, 22.560793],
  [51.238429, 22.561031],
  [51.238410, 22.561307], // 81 - koniec, skręt tau
  [51.238397, 22.561371],
  [51.238380, 22.561404], // 83 - koniec, łuk ypsilon
  [51.238009, 22.561983],
  [51.237752, 22.562543], // 85- koniec
  [51.237336, 22.563635], // 86 - łuk fi
  [51.237158, 22.564021],
  [51.237007, 22.564252], // 88 - koniec, skręt chi
  [51.236983, 22.564275],
  [51.236958, 22.564270],
  [51.236925, 22.564241], // 91 - koniec
  [51.235938, 22.562582], // 92 - skręt psi (rondo)
  [51.235911, 22.562462],
  [51.235907, 22.562398],
  [51.235938, 22.562280],
  [51.235978, 22.562167], // 96 - koniec
  [51.23634, 22.56145], // 97 - omega (meta)
  [51.23634, 22.56145],
  [51.23634, 22.56145],
  [51.23634, 22.56145],
  [51.23634, 22.56145],
  [51.23634, 22.56145],
  [51.23634, 22.56145],
  [51.23634, 22.56145],
  [51.23634, 22.56145],
  [51.23634, 22.56145],
  [51.23634, 22.56145],
  [51.23634, 22.56145],
  [51.23634, 22.56145],
  [51.23634, 22.56145],
  [51.23634, 22.56145],
  [51.23634, 22.56145],
  [51.23634, 22.56145],
  [51.23634, 22.56145],
  [51.23634, 22.56145],
  [51.23634, 22.56145],
  [51.23634, 22.56145],
  [51.23634, 22.56145],
  [51.23634, 22.56145],
  [51.23634, 22.56145],
  [51.23634, 22.56145],
  [51.23634, 22.56145],
  [51.23634, 22.56145],
  [51.23634, 22.56145],
  [51.23634, 22.56145],
  [51.23634, 22.56145],
  [51.23634, 22.56145],
  [51.23634, 22.56145],
  [51.23634, 22.56145],
  [51.23634, 22.56145],
  [51.23634, 22.56145],
  [51.23634, 22.56145],
  [51.23634, 22.56145],
  [51.23634, 22.56145],
  [51.23634, 22.56145],
  [51.23634, 22.56145],
  [51.23634, 22.56145],
  [51.23634, 22.56145],
  [51.23634, 22.56145],
  [51.23634, 22.56145],
  [51.23634, 22.56145],
  [51.23634, 22.56145],
  [51.23634, 22.56145],
  [51.23634, 22.56145],
  [51.23634, 22.56145],
  [51.23634, 22.56145],
  [51.23634, 22.56145],
  [51.23634, 22.56145],
  [51.23634, 22.56145],
  [51.23634, 22.56145],
  [51.23634, 22.56145],
  [51.23634, 22.56145],
  [51.23634, 22.56145],
  [51.23634, 22.56145],
  [51.23634, 22.56145],
  [51.23634, 22.56145],
  [51.23634, 22.56145],
  [51.23634, 22.56145],
];

const START_POINT = ROUTE_LOOP[0];
// const WATER_POINT = ROUTE_LOOP[43];

// Dwa pełne okrążenia: pętla 1 zamknięta powrotem do startu, potem pętla 2
// od razu dalej, też zamknięta na mecie.
const ROUTE = [...ROUTE_LOOP, START_POINT, ...ROUTE_LOOP.slice(1), START_POINT];

// Zasięg trasy - jedno okrążenie wystarcza, oba mają te same skrajne punkty.
// Liczone raz na starcie, bo ROUTE_LOOP jest stałą.
const ROUTE_BOUNDS = L.latLngBounds(ROUTE_LOOP);

// Środek/zoom startowe - tylko pierwsza klatka, zanim FitRouteBounds (niżej)
// dopasuje kadr do ROUTE_BOUNDS. Bez tego MapContainer wymaga center+zoom
// jako propsów startowych.
const CENTER = [51.23672, 22.56139];

// Dopasowuje kadr mapy do zasięgu całej trasy, zamiast sztywnego center+zoom -
// inaczej południowa część pętli (albo dowolna inna, zależnie od kształtu
// kontenera) wychodziła poza widoczny obszar. Przelicza się od nowa przy
// KAŻDEJ zmianie rozmiaru kontenera (ResizeObserver), nie tylko raz przy
// montowaniu - kontener mapy ma różną wysokość/szerokość zależnie od
// breakpointu (h-96/sm:h-[440px]/lg:h-[620px], 1 vs 2 kolumny), więc bez tego
// trasa mieściłaby się dobrze tylko w rozmiarze, w jakim mapa się zamontowała.
function FitRouteBounds({ bounds }) {
  const map = useMap();

  useEffect(() => {
    const dopasuj = () => {
      // invalidateSize zanim fitBounds - inaczej Leaflet liczy kadr względem
      // starego, zapamiętanego rozmiaru kontenera sprzed zmiany.
      map.invalidateSize();
      // animate:false - domyślnie fitBounds PRZESUWA i PRZYBLIŻA płynną
      // animacją (CSS transform napędzany requestAnimationFrame). Przy każdej
      // zmianie rozmiaru kontenera (ResizeObserver niżej) to zbędne miganie -
      // wyłączone ustawia docelowy kadr od razu, jedną klatką.
      map.fitBounds(bounds, { padding: [24, 24], animate: false });
    };
    dopasuj();

    // ResizeObserver łapie zmiany kontenera niezwiązane z resize okna (np.
    // przejście layoutu z 2 kolumn na 1 przy tej samej szerokości okna).
    // window.resize to uzupełnienie na wypadek, gdyby to akurat ResizeObserver
    // nie złapał - tak samo jak w efekcie mierzącym logo w page.tsx.
    const ro = new ResizeObserver(dopasuj);
    ro.observe(map.getContainer());
    window.addEventListener('resize', dopasuj);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', dopasuj);
    };
  }, [map, bounds]);

  return null;
}

export default function RouteMap() {
  const startIcon = L.divIcon({
    html: '<div class="route-start-pin"></div>',
    className: '',
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
  /*const waterIcon = L.divIcon({
    html: '<div class="route-water-pin"></div>',
    className: '',
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });*/

  return (
    <MapContainer
      center={CENTER}
      zoom={16}
      // zoomSnap=0 - domyślne 1 zaokrągla KAŻDY zoom (też ten z fitBounds) do
      // pełnej liczby - Math.round, więc czasem W GÓRĘ względem idealnego
      // dopasowania, co dawałoby ciut za mocno przybliżony kadr. Bez
      // zaokrąglania fitBounds trafia w dokładny, ułamkowy poziom zoomu.
      // Brak widocznych przycisków zoomu (zoomControl=false) i wyłączony
      // scroll-zoom - ułamkowy poziom nigdzie się użytkownikowi nie pokazuje
      // jako "dziwna" liczba.
      zoomSnap={0}
      style={{ width: '100%', height: '100%' }}
      zoomControl={false}
      scrollWheelZoom={false}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
        subdomains="abcd"
        maxZoom={20}
      />
      <FitRouteBounds bounds={ROUTE_BOUNDS} />
      <Polyline
        positions={ROUTE}
        pathOptions={{
          color: '#CE2F25',
          weight: 5,
          opacity: 0.95,
          lineCap: 'round',
          lineJoin: 'round',
        }}
      />
      <Marker
        position={START_POINT}
        icon={startIcon}
        title="Start i Meta - Park Ludowy, przy rondzie od strony Targów Lublin"
        alt="Start i Meta biegu - Park Ludowy, przy rondzie od strony Targów Lublin"
        eventHandlers={{
          add: (e) => {
            const el = e.target.getElement();
            if (el) el.setAttribute('aria-label', 'Start i Meta biegu - Park Ludowy, przy rondzie od strony Targów Lublin');
          },
        }}
      >
        <Popup className="route-popup">
          <strong>Start / Meta</strong><br />Park Ludowy, przy rondzie od strony Targów Lublin
        </Popup>
      </Marker>
      <ScrollZoomIntent />
    </MapContainer>
  );
}
