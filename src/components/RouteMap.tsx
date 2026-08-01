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

// Jedno okrążenie (~2,3 km) po realnych alejkach Parku Ludowego w Lublinie —
// punkty odczytane z granicy parku w OpenStreetMap (way 288089348), więc
// pokrywają się z faktycznymi ścieżkami, a nie prostą linią między punktami.
// Zweryfikowane odległością do sąsiednich obiektów z OSM:
//  - punkt nr 24 (naroznik) leży ~20 m od Alei Józefa Piłsudskiego,
//  - punkty nadrzeczne (ok. 45-72) leżą 15-200 m od rzeki Bystrzycy.
// Dystans 5 km = 2 okrążenia tej pętli (patrz ROUTE niżej) + niewielki zapas
// na strefę startu/mety, zgodnie z „5 km (2 pętle)" opisanym na stronie.
//
// START/META (punkt 0) przesunięty — na prośbę sztabu — bliżej półkola przy
// Targach Lublin (wschodnia strona parku), a nie w stronę fontanny: to
// najbliższy realny punkt granicy parku względem Targów Lublin (ok. 200 m od
// ich terenu), leżący na w miarę prostym odcinku alejki.
const ROUTE_LOOP = [
  [51.23708, 22.56438], // 0 — START / META (bliżej Targów Lublin, na prostej)
  [51.23723, 22.56414],
  [51.23742, 22.56384],
  [51.23755, 22.56364],
  [51.23775, 22.56331],
  [51.23790, 22.56308],
  [51.23802, 22.56287],
  [51.23817, 22.56261],
  [51.23822, 22.56252],
  [51.23831, 22.56234],
  [51.23840, 22.56213],
  [51.23862, 22.56161],
  [51.23864, 22.56157],
  [51.23865, 22.56153],
  [51.23871, 22.56139],
  [51.23878, 22.56121],
  [51.23920, 22.56017],
  [51.23922, 22.56013],
  [51.23924, 22.56009],
  [51.23935, 22.55981],
  [51.23936, 22.55980],
  [51.23938, 22.55974],
  [51.23941, 22.55969],
  [51.23947, 22.55955],
  [51.23952, 22.55941], // 24 — naroznik przy al. Piłsudskiego: PUNKT MEDYCZNY 1
  [51.23940, 22.55932],
  [51.23911, 22.55885],
  [51.23878, 22.55849],
  [51.23854, 22.55842],
  [51.23849, 22.55842],
  [51.23823, 22.55843],
  [51.23787, 22.55843],
  [51.23773, 22.55844],
  [51.23771, 22.55844],
  [51.23765, 22.55844],
  [51.23748, 22.55844],
  [51.23713, 22.55845],
  [51.23711, 22.55845],
  [51.23668, 22.55848],
  [51.23640, 22.55848],
  [51.23612, 22.55843],
  [51.23578, 22.55823],
  [51.23540, 22.55781],
  [51.23522, 22.55749],
  [51.23515, 22.55749],
  [51.23504, 22.55729],
  [51.23491, 22.55749],
  [51.23492, 22.55758],
  [51.23484, 22.55752],
  [51.23481, 22.55757],
  [51.23489, 22.55774],
  [51.23480, 22.55784],
  [51.23478, 22.55788],
  [51.23478, 22.55792],
  [51.23480, 22.55796],
  [51.23482, 22.55796],
  [51.23484, 22.55795],
  [51.23497, 22.55776],
  [51.23502, 22.55775],
  [51.23506, 22.55778],
  [51.23508, 22.55785],
  [51.23507, 22.55792],
  [51.23505, 22.55797],
  [51.23499, 22.55803],
  [51.23491, 22.55810],
  [51.23488, 22.55810], // 65 — nabrzeże Bystrzycy (~1/3 od dołu): PUNKT MEDYCZNY 2 + WODA
  [51.23485, 22.55809],
  [51.23479, 22.55802],
  [51.23474, 22.55797],
  [51.23471, 22.55796],
  [51.23467, 22.55800],
  [51.23453, 22.55824],
  [51.23407, 22.55902],
  [51.23404, 22.55906],
  [51.23400, 22.55914],
  [51.23391, 22.55930],
  [51.23385, 22.55922],
  [51.23380, 22.55930],
  [51.23374, 22.55938],
  [51.23372, 22.55941],
  [51.23371, 22.55943],
  [51.23370, 22.55941],
  [51.23315, 22.56037],
  [51.23310, 22.56046],
  [51.23299, 22.56067],
  [51.23275, 22.56117],
  [51.23243, 22.56162],
  [51.23243, 22.56165], // najdalej na południe
  [51.23244, 22.56173],
  [51.23254, 22.56201],
  [51.23259, 22.56215],
  [51.23275, 22.56261],
  [51.23285, 22.56295],
  [51.23288, 22.56309],
  [51.23312, 22.56388],
  [51.23375, 22.56339],
  [51.23405, 22.56391],
  [51.23434, 22.56436],
  [51.23438, 22.56435],
  [51.23543, 22.56259],
  [51.23554, 22.56276],
  [51.23556, 22.56279],
  [51.23617, 22.56372],
  [51.23620, 22.56375],
  [51.23685, 22.56474], // najbliżej Targów Lublin
  [51.23702, 22.56449],
];

const START_POINT = ROUTE_LOOP[0];
const MEDICAL_1 = ROUTE_LOOP[24];
const MEDICAL_2_WATER = ROUTE_LOOP[65];

// Dwa pełne okrążenia (5 km): pętla 1 zamknięta powrotem do startu, potem
// pętla 2 od razu dalej, też zamknięta na mecie.
const ROUTE = [...ROUTE_LOOP, START_POINT, ...ROUTE_LOOP.slice(1), START_POINT];

const CENTER = [51.2359, 22.5601];

export default function RouteMap() {
  const startIcon = L.divIcon({
    html: '<div class="route-start-pin"></div>',
    className: '',
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
  const medicalIcon = L.divIcon({
    html: '<div class="route-medical-pin">+</div>',
    className: '',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
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
      zoom={15}
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
        title="Start i Meta - Park Ludowy, od strony Targów Lublin"
        alt="Start i Meta biegu - Park Ludowy, od strony Targów Lublin"
        eventHandlers={{
          add: (e) => {
            const el = e.target.getElement();
            if (el) el.setAttribute('aria-label', 'Start i Meta biegu - Park Ludowy, od strony Targów Lublin');
          },
        }}
      >
        <Popup className="route-popup">
          <strong>Start / Meta</strong><br />Park Ludowy, od strony Targów Lublin
        </Popup>
      </Marker>
      <Marker
        position={MEDICAL_1}
        icon={medicalIcon}
        title="Punkt medyczny - róg parku przy al. Piłsudskiego"
        alt="Punkt medyczny - róg parku przy al. Piłsudskiego"
      >
        <Popup className="route-popup">
          <strong>Punkt medyczny</strong><br />Róg parku, al. Józefa Piłsudskiego
        </Popup>
      </Marker>
      <Marker
        position={MEDICAL_2_WATER}
        icon={waterIcon}
        title="Punkt medyczny i punkt z wodą - nabrzeże Bystrzycy"
        alt="Punkt medyczny i punkt z wodą - nabrzeże Bystrzycy"
      >
        <Popup className="route-popup">
          <strong>Punkt medyczny + woda</strong><br />Nabrzeże Bystrzycy
        </Popup>
      </Marker>
      <ScrollZoomIntent />
    </MapContainer>
  );
}
