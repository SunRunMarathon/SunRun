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
  [51.23596, 22.56218], // 0 - START/META (blisko ronda, na ostrodze)
  [51.2367, 22.56069],
  [51.23704, 22.55998],
  [51.23706, 22.55995],
  [51.23707, 22.55993],
  [51.23713, 22.5598],
  [51.23716, 22.55975],
  [51.23729, 22.55949],
  [51.23731, 22.55932],
  [51.23732, 22.55931],
  [51.23721, 22.55915],
  [51.23721, 22.55917],
  [51.2371, 22.55926],
  [51.23697, 22.55952],
  [51.23656, 22.56035],
  [51.23651, 22.56045],
  [51.23623, 22.56103],
  [51.23579, 22.56191],
  [51.23578, 22.56195],
  [51.23576, 22.56198],
  [51.23568, 22.56212],
  [51.23577, 22.56228],
  [51.23585, 22.5624],
  [51.23593, 22.56256],
  [51.23629, 22.56317],
  [51.23697, 22.5643],
  [51.23705, 22.56444],
  [51.23706, 22.56445],
  [51.23712, 22.56407],
  [51.23715, 22.56401],
  [51.23719, 22.56394],
  [51.23726, 22.5638],
  [51.2375, 22.56319],
  [51.23775, 22.56253],
  [51.23789, 22.56222],
  [51.23796, 22.56207],
  [51.23812, 22.56181],
  [51.23827, 22.56157],
  [51.23837, 22.5614],
  [51.23839, 22.56136],
  [51.23841, 22.5613],
  [51.23843, 22.56106],
  [51.23845, 22.56081],
  [51.23848, 22.56065],
  [51.23852, 22.56052],
  [51.23855, 22.56043],
  [51.23859, 22.56031],
  [51.23865, 22.56017],
  [51.23874, 22.55994],
  [51.23888, 22.55961],
  [51.23931, 22.55956],
  [51.23938, 22.5594],
  [51.23933, 22.55933],
  [51.23921, 22.55913],
  [51.23908, 22.55894],
  [51.239, 22.55884],
  [51.23884, 22.55869],
  [51.23875, 22.55862],
  [51.23865, 22.55858],
  [51.23855, 22.55854],
  [51.2385, 22.55854],
  [51.23839, 22.55853],
  [51.23823, 22.55854],
  [51.23807, 22.55854],
  [51.23796, 22.55854],
  [51.23784, 22.55855],
  [51.23771, 22.55856],
  [51.23766, 22.55856],
  [51.23763, 22.55856],
  [51.23748, 22.55857],
  [51.23745, 22.55857],
  [51.23729, 22.55858],
  [51.23713, 22.55858],
  [51.23696, 22.55858],
  [51.23664, 22.55859],
  [51.23645, 22.55859],
  [51.23636, 22.55858],
  [51.23626, 22.55856],
  [51.23616, 22.55854],
  [51.23608, 22.55851],
  [51.23597, 22.55846],
  [51.23587, 22.55842],
  [51.23573, 22.55833], // 82 - WODA (poludniowo-zachodnia czesc parku)
  [51.23545, 22.55805],
  [51.23542, 22.55812],
  [51.2354, 22.55818],
  [51.23539, 22.55826],
  [51.23537, 22.55833],
  [51.23535, 22.55841],
  [51.23531, 22.55849],
  [51.23527, 22.55857],
  [51.2352, 22.55865],
  [51.23516, 22.55867],
  [51.23512, 22.55869],
  [51.23506, 22.5587],
  [51.23498, 22.5587],
  [51.23493, 22.5587],
  [51.23487, 22.55869],
  [51.23479, 22.5587],
  [51.23473, 22.55872],
  [51.23466, 22.55875],
  [51.23455, 22.55882],
  [51.23446, 22.55892],
  [51.23436, 22.55907],
  [51.23432, 22.55916],
  [51.23426, 22.55929],
  [51.23422, 22.55941],
  [51.23417, 22.55961],
  [51.23406, 22.55944],
  [51.23374, 22.55938],
  [51.23373, 22.55938],
  [51.23346, 22.55976],
  [51.23298, 22.5606],
  [51.23269, 22.56118],
  [51.23243, 22.56156],
  [51.2324, 22.5616],
  [51.23238, 22.56163],
  [51.23238, 22.56167],
  [51.23238, 22.56171],
  [51.23239, 22.56174],
  [51.23241, 22.5618],
  [51.23243, 22.56185],
  [51.23252, 22.5621],
  [51.23255, 22.56208],
  [51.23268, 22.56203],
  [51.23272, 22.56215],
  [51.23279, 22.56229],
  [51.23288, 22.56242],
  [51.23291, 22.5625],
  [51.23294, 22.56258],
  [51.23299, 22.56266],
  [51.23302, 22.56271],
  [51.23306, 22.56273],
  [51.23311, 22.56275],
  [51.23316, 22.56276],
  [51.23322, 22.56275],
  [51.23329, 22.56273],
  [51.23337, 22.56272],
  [51.23345, 22.5627],
  [51.23353, 22.56267],
  [51.23359, 22.56268],
  [51.23366, 22.56268],
  [51.23377, 22.56264],
  [51.23392, 22.56261],
  [51.23403, 22.56259],
  [51.23413, 22.56257],
  [51.23416, 22.56256],
  [51.23435, 22.56254],
  [51.23448, 22.56251],
  [51.23457, 22.56248],
  [51.23463, 22.56248],
  [51.23472, 22.5625],
  [51.23485, 22.56246],
  [51.23494, 22.56242],
  [51.23506, 22.56237],
  [51.23517, 22.56232],
  [51.2353, 22.56229],
  [51.2354, 22.5623],
  [51.23552, 22.56231],
];

const START_POINT = ROUTE_LOOP[0];
const WATER_POINT = ROUTE_LOOP[82];

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
  const waterIcon = L.divIcon({
    html: '<div class="route-water-pin"></div>',
    className: '',
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });

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
      <Marker
        position={WATER_POINT}
        icon={waterIcon}
        title="Punkt z wodą - południowo-zachodnia część parku"
        alt="Punkt z wodą - południowo-zachodnia część parku"
      >
        <Popup className="route-popup">
          <strong>Punkt z wodą</strong><br />Południowo-zachodnia część Parku Ludowego
        </Popup>
      </Marker>
      <ScrollZoomIntent />
    </MapContainer>
  );
}
