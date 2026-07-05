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

// Przybliżona trasa 5 km przez Park Ludowy w Lublinie (2 pętle × ~2.5 km)
const ROUTE: [number, number][] = [
  [51.2478, 22.5508], // Start / Meta
  [51.2483, 22.5527],
  [51.2483, 22.5549],
  [51.2475, 22.5572],
  [51.2463, 22.5583],
  [51.2451, 22.5574],
  [51.2442, 22.5557],
  [51.2441, 22.5534],
  [51.2448, 22.5516],
  [51.2459, 22.5504],
  [51.2470, 22.5501],
  [51.2478, 22.5508], // Koniec pętli 1
  [51.2481, 22.5521],
  [51.2480, 22.5543],
  [51.2473, 22.5562],
  [51.2462, 22.5572],
  [51.2451, 22.5564],
  [51.2445, 22.5549],
  [51.2446, 22.5531],
  [51.2453, 22.5516],
  [51.2463, 22.5510],
  [51.2472, 22.5509],
  [51.2478, 22.5508], // Meta
];

const CENTER: [number, number] = [51.2462, 22.5542];

export default function RouteMap() {
  const startIcon = L.divIcon({
    html: '<div class="route-start-pin"></div>',
    className: '',
    iconSize: [22, 22],
    iconAnchor: [11, 11],
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
          color: '#ED3939',
          weight: 5,
          opacity: 0.95,
          lineCap: 'round',
          lineJoin: 'round',
        }}
      />
      <Marker
        position={ROUTE[0]}
        icon={startIcon}
        title="Start i Meta — Park Ludowy, al. Piłsudskiego"
        alt="Start i Meta biegu — Park Ludowy, al. Piłsudskiego"
        eventHandlers={{
          add: (e) => {
            const el = e.target.getElement();
            if (el) el.setAttribute('aria-label', 'Start i Meta biegu — Park Ludowy, al. Piłsudskiego');
          },
        }}
      >
        <Popup className="route-popup">
          <strong>Start / Meta</strong><br />Park Ludowy, al. Piłsudskiego
        </Popup>
      </Marker>
      <ScrollZoomIntent />
    </MapContainer>
  );
}
