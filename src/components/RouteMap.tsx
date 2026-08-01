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

// TRZECIE podejście do tej trasy. Pierwsze szło po obrysie parku z OSM (to
// nie jest ścieżka do biegania). Drugie łączyło realne alejki, ale użyło
// niewłaściwego odcinka przy Targach (spoke przez środek zamiast realnej
// krawędzi) i błędnie zorientowanej "prostej" - dawało to widoczne wystające
// "ogonki" na mapie. Milosz przysłał wzorzec z Google Maps (żółta trasa) -
// ta wersja jest zbudowana pod TEN wzorzec: jedna zamknięta pętla po
// obwodzie parku + jedna wewnętrzna ostroga do fontanny, nic więcej.
//
// Każdy odcinek to konkretny, zweryfikowany fragment alejki z OpenStreetMap
// (Overpass API), połączony w kolejności:
//
//  0-9    Jedna z dwóch równoległych alejek "Aleja Europejskiej Stolicy
//         Młodzieży Lublin 2023" (way 1005433130) - START leży na niej,
//         blisko ronda, po czym trasa dochodzi do fontanny.
//  9-13   Szpilka przy fontannie (way 294448132/1057965793) - ciasny zawrót
//         przy okrągłym zbiorniku wodnym.
//  13-23  Druga równoległa alejka (way 294442930) z powrotem do ronda.
//  23     Rondo przy Targach Lublin (way 995319618) - węzeł centralny, z
//         którego odchodzą trzy ramiona.
//  24-28  Realne połączenie rondo -> narożnik wschodni (way 294442933) -
//         to jest odcinek, którego brakowało w drugiej wersji (był tam
//         objazd przez środek parku, stąd "ogonek" na starej mapie).
//  29-50  Ramię północne wzdłuż al. Piłsudskiego (way 286179378) do
//         narożnika północnego.
//  51-83  Ramię zachodnie wzdłuż Bystrzycy (way 451709904) do punktu z wodą.
//  83     PUNKT Z WODĄ - realne skrzyżowanie alejek w płd-zach części parku
//         (punkty medyczne usunięte na prośbę Milosza, ten punkt został).
//  84-109 Ramię południowe (way 62364771 + 286178730) wzdłuż południowej
//         krawędzi.
//  109-144 Pętla wokół płata w południowej części parku (way 1005422292) -
//         to jest "obiega płat", o którym pisał Milosz.
//  144-149 Powrót skosem na północny wschód do ronda (way 62364768).
//
// START/META (punkt 0) leży NA OSTRODZE, bliżej ronda niż fontanny -
// zgodnie z prośbą Milosza ("dalej na prostej, dalej od fontanny").
//
// Zweryfikowany dystans jednego okrążenia (Haversine, z zamknięciem pętli
// do startu): ok. 2,34 km. Dwa okrążenia (5 km wg założenia) dają ok.
// 4,68 km - trochę mniej niż 5 km, ale bliżej tego celu niż poprzednie
// wersje. Ostateczny dystans i tak zmierzy pomiar do certyfikacji PZLA.
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
  [51.23567, 22.55853],
  [51.2356, 22.55853],
  [51.23554, 22.55854],
  [51.2355, 22.55856],
  [51.23546, 22.55858],
  [51.2354, 22.55864],
  [51.23534, 22.55873],
  [51.23525, 22.55892],
  [51.23518, 22.55904],
  [51.23507, 22.55925],
  [51.23493, 22.55952],
  [51.23459, 22.56014],
  [51.23454, 22.56023],
  [51.23446, 22.56039],
  [51.23433, 22.5606],
  [51.23425, 22.56075],
  [51.23418, 22.56089],
  [51.23412, 22.56101],
  [51.23409, 22.5611],
  [51.23407, 22.56121],
  [51.23407, 22.56131],
  [51.23407, 22.56144],
  [51.23408, 22.56167],
  [51.23412, 22.56208],
  [51.23413, 22.56233],
  [51.23416, 22.56256],
  [51.23417, 22.56263],
  [51.23418, 22.56276],
  [51.23418, 22.5629],
  [51.23419, 22.563],
  [51.2342, 22.56311],
  [51.23421, 22.56322],
  [51.23423, 22.56331],
  [51.23425, 22.56339],
  [51.23428, 22.56346],
  [51.23431, 22.5635],
  [51.23435, 22.56355],
  [51.23439, 22.56356],
  [51.23443, 22.56357],
  [51.23447, 22.56357],
  [51.2345, 22.56355],
  [51.23454, 22.56353],
  [51.23457, 22.5635],
  [51.2346, 22.56346],
  [51.23463, 22.56341],
  [51.23466, 22.56336],
  [51.23468, 22.56331],
  [51.2347, 22.56326],
  [51.23471, 22.5632],
  [51.23473, 22.56313],
  [51.23475, 22.56307],
  [51.23477, 22.56304],
  [51.23481, 22.563],
  [51.23484, 22.56293],
  [51.23486, 22.56289],
  [51.23487, 22.56283],
  [51.23486, 22.56274],
  [51.23485, 22.56267],
  [51.23484, 22.56261],
  [51.23485, 22.56248],
  [51.23485, 22.56246],
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

const CENTER = [51.23672, 22.56139];

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
